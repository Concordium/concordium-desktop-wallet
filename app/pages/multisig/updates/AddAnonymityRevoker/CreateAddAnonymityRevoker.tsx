import React, { useCallback } from 'react';
import { Validate } from 'react-hook-form';
import { EqualRecord, AddAnonymityRevoker, Description } from '~/utils/types';
import Form from '~/components/Form';
import { UpdateProps } from '~/utils/transactionTypes';
import { useAnonymityRevokers } from '~/utils/dataHooks';
import {
    lengthRule,
    validateHex,
    mustBeAnInteger,
    requiredMessage,
    pasteHere,
    enterHere,
} from '../common/util';

export type AddAnonymityRevokerFields = Omit<
    AddAnonymityRevoker,
    'arDescription'
> &
    Description;

const fieldNames: EqualRecord<AddAnonymityRevokerFields> = {
    name: 'name',
    url: 'url',
    description: 'description',
    arIdentity: 'arIdentity',
    arPublicKey: 'arPublicKey',
};

export const fieldDisplays = {
    name: 'Name',
    url: 'URL',
    description: 'Description',
    arIdentity: 'Identity disclosure authority',
    arPublicKey: 'Public key',
};

const publicKeyLength = 192;
const arLengthRule = lengthRule(fieldDisplays.arPublicKey, publicKeyLength);

/**
 * Component for creating an addAnonymityRevoker transaction.
 */
export default function CreateAddAnonymityRevoker({
    defaults,
}: UpdateProps): JSX.Element | null {
    const anonymityRevokers = useAnonymityRevokers();
    const arIdentityMustBeUnique = useCallback<Validate>(
        (v) =>
            anonymityRevokers
                ? !anonymityRevokers
                      .map((revoker) => revoker.arIdentity.toString())
                      .includes(v) ||
                  `This ${fieldDisplays.arIdentity} is already in use`
                : 'Identity disclosure authorities have not been loaded yet',
        [anonymityRevokers]
    );

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
                name={fieldNames.arIdentity}
                defaultValue={defaults.arIdentity || undefined}
                label={fieldDisplays.arIdentity}
                placeholder={enterHere(fieldDisplays.arIdentity)}
                rules={{
                    required: requiredMessage(fieldDisplays.arIdentity),
                    validate: {
                        mustBeAnInteger,
                        arIdentityMustBeUnique,
                    },
                }}
            />
            <Form.TextArea
                className="body2"
                name={fieldNames.arPublicKey}
                defaultValue={defaults.arPublicKey || undefined}
                label={fieldDisplays.arPublicKey}
                placeholder={pasteHere(fieldDisplays.arPublicKey)}
                spellCheck={false}
                rules={{
                    required: requiredMessage(fieldDisplays.arPublicKey),
                    minLength: arLengthRule,
                    maxLength: arLengthRule,
                    validate: validateHex(fieldDisplays.arPublicKey),
                }}
            />
        </>
    );
}
