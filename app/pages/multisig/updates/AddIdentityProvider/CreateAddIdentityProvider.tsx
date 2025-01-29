import React, { useCallback, useState } from 'react';
import { Validate } from 'react-hook-form';
import { Buffer } from 'buffer/';

import { hashSha256 } from '~/utils/serializationHelpers';
import { EqualRecord, AddIdentityProvider, Description } from '~/utils/types';
import Form from '~/components/Form';
import { UpdateProps } from '~/utils/transactionTypes';
import { useIdentityProviders } from '~/utils/dataHooks';
import {
    lengthRule,
    validateHex,
    mustBeAnInteger,
    requiredMessage,
    pasteHere,
    enterHere,
} from '../common/util';
import styles from './addIdentityProvider.module.scss';
import { isHex } from '~/utils/basicHelpers';

export type AddIdentityProviderFields = Omit<
    AddIdentityProvider,
    'ipDescription'
> &
    Description;

const fieldNames: EqualRecord<AddIdentityProviderFields> = {
    name: 'name',
    url: 'url',
    description: 'description',
    ipIdentity: 'ipIdentity',
    ipVerifyKey: 'ipVerifyKey',
    ipCdiVerifyKey: 'ipCdiVerifyKey',
};

export const fieldDisplays = {
    name: 'Name',
    url: 'URL',
    description: 'Description',
    ipIdentity: 'Identity provider',
    ipVerifyKey: 'Verify key',
    ipCdiVerifyKey: 'CDI verify key',
};

const cdiKeyLength = 64;
const cdiKeyRule = lengthRule(fieldDisplays.ipCdiVerifyKey, cdiKeyLength);

/**
 * Component for creating an addIdentityProvider transaction.
 */
export default function CreateAddIdentityProvider({
    defaults,
}: UpdateProps): JSX.Element | null {
    const identityProviders = useIdentityProviders();
    const ipIdentityMustBeUnique = useCallback<Validate>(
        (v) =>
            identityProviders
                ? !identityProviders
                      .map((provider) => provider.ipIdentity.toString())
                      .includes(v) ||
                  `This ${fieldDisplays.ipIdentity} is already in use`
                : 'Identity providers have not been loaded yet',
        [identityProviders]
    );

    const [ipVerifyKeyHash, setIpVerifyKeyHash] = useState<string>('');

    return (
        <>
            <Form.TextArea
                className="body2"
                name={fieldNames.name}
                label={fieldDisplays.name}
                defaultValue={defaults.name || undefined}
                placeholder={enterHere(fieldDisplays.name)}
                rules={{ required: requiredMessage(fieldDisplays.name) }}
            />
            <Form.Input
                className="body2"
                name={fieldNames.url}
                defaultValue={defaults.url || undefined}
                label={fieldDisplays.url}
                placeholder={enterHere(fieldDisplays.url)}
                rules={{ required: requiredMessage(fieldDisplays.url) }}
            />
            <Form.TextArea
                className="body2"
                name={fieldNames.description}
                defaultValue={defaults.description || undefined}
                label={fieldDisplays.description}
                placeholder={enterHere(fieldDisplays.description)}
            />
            <Form.Input
                className="body2"
                name={fieldNames.ipIdentity}
                defaultValue={defaults.ipIdentity || undefined}
                label={fieldDisplays.ipIdentity}
                placeholder={enterHere(fieldDisplays.ipIdentity)}
                rules={{
                    required: requiredMessage(fieldDisplays.ipIdentity),
                    validate: {
                        mustBeAnInteger,
                        ipIdentityMustBeUnique,
                    },
                }}
            />
            <Form.TextArea
                className={styles.ipVerifyKey}
                name={fieldNames.ipVerifyKey}
                defaultValue={defaults.ipVerifyKey || undefined}
                label={fieldDisplays.ipVerifyKey}
                rows={1}
                noAutoScale
                spellCheck={false}
                placeholder={pasteHere(fieldDisplays.ipVerifyKey)}
                onChange={(e) => {
                    const key = e.target.value;
                    if (isHex(key)) {
                        setIpVerifyKeyHash(
                            hashSha256(Buffer.from(key, 'hex')).toString('hex')
                        );
                    } else {
                        setIpVerifyKeyHash('');
                    }
                }}
                rules={{
                    required: requiredMessage(fieldDisplays.ipVerifyKey),
                    validate: validateHex(fieldDisplays.ipVerifyKey),
                }}
            />
            {ipVerifyKeyHash && (
                <div className="body2">
                    <h5 className="mB0">{fieldDisplays.ipVerifyKey} Hash</h5>
                    {ipVerifyKeyHash}
                </div>
            )}
            <Form.TextArea
                className="body2"
                name={fieldNames.ipCdiVerifyKey}
                defaultValue={defaults.ipCdiVerifyKey || undefined}
                label={fieldDisplays.ipCdiVerifyKey}
                spellCheck={false}
                placeholder={pasteHere(fieldDisplays.ipCdiVerifyKey)}
                rules={{
                    required: requiredMessage(fieldDisplays.ipCdiVerifyKey),
                    minLength: cdiKeyRule,
                    maxLength: cdiKeyRule,
                    validate: validateHex(fieldDisplays.ipCdiVerifyKey),
                }}
            />
        </>
    );
}
