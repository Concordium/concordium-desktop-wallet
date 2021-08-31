import React, { useCallback } from 'react';
import { Validate, ValidationRule } from 'react-hook-form';

import { EqualRecord, AddIdentityProvider, Description } from '~/utils/types';
import { isHex, onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import Form from '~/components/Form';
import { UpdateProps } from '~/utils/transactionTypes';
import { useIdentityProviders } from '~/utils/dataHooks';

export type AddIdentityProviderFields = Omit<
    AddIdentityProvider,
    'ipDescription'
> &
    Description;

const cdiKeyLength = 64;

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
    ipIdentity: 'Identity Provider',
    ipVerifyKey: 'Verify Key',
    ipCdiVerifyKey: 'CDI Verify Key:',
};

const requiredMessage = (name: string) => `${name} is required`;
const pasteHere = (name: string) => `Paste ${name} here`;
const enterHere = (name: string) => `Enter ${name} here`;

const mustBeANumber: Validate = (v) =>
    onlyDigitsNoLeadingZeroes(v) || 'Must be a valid number';

const lengthRule: ValidationRule<number> = {
    value: cdiKeyLength,
    message: `${fieldDisplays.ipCdiVerifyKey} must be ${cdiKeyLength} characters`,
};

const validateHex: (name: string) => Validate = (name: string) => (v: string) =>
    isHex(v) || `${name} must be HEX format`;

/**
 * Component for creating an addIdentityProvider transaction.
 */
export default function CreateAddIdentityProvider({
    defaults,
}: UpdateProps): JSX.Element | null {
    const identityProviders = useIdentityProviders();
    const ipIdentityMustBeUnique = useCallback<Validate>(
        (v) =>
            !identityProviders
                .map((provider) => provider.ipIdentity.toString())
                .includes(v) ||
            `This ${fieldDisplays.ipIdentity} is already in use`,
        [identityProviders]
    );

    return (
        <>
            <Form.TextArea
                className="body1"
                name={fieldNames.name}
                label={fieldDisplays.name}
                defaultValue={defaults.name || undefined}
                placeholder={enterHere(fieldDisplays.name)}
                rules={{ required: requiredMessage(fieldDisplays.name) }}
            />
            <Form.Input
                className="body1"
                name={fieldNames.url}
                defaultValue={defaults.url || undefined}
                label={fieldDisplays.url}
                placeholder={enterHere(fieldDisplays.url)}
                rules={{ required: requiredMessage(fieldDisplays.url) }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.description}
                defaultValue={defaults.description || undefined}
                label={fieldDisplays.description}
                placeholder={enterHere(fieldDisplays.description)}
            />
            <Form.Input
                className="body1"
                name={fieldNames.ipIdentity}
                defaultValue={defaults.ipIdentity || undefined}
                label={fieldDisplays.ipIdentity}
                placeholder={enterHere(fieldDisplays.ipIdentity)}
                rules={{
                    required: requiredMessage(fieldDisplays.ipIdentity),
                    validate: {
                        mustBeANumber,
                        ipIdentityMustBeUnique,
                    },
                }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.ipVerifyKey}
                defaultValue={defaults.ipVerifyKey || undefined}
                label={fieldDisplays.ipVerifyKey}
                placeholder={pasteHere(fieldDisplays.ipVerifyKey)}
                rules={{
                    required: requiredMessage(fieldDisplays.ipVerifyKey),
                    validate: validateHex(fieldDisplays.ipVerifyKey),
                }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.ipCdiVerifyKey}
                defaultValue={defaults.ipCdiVerifyKey || undefined}
                label={fieldDisplays.ipCdiVerifyKey}
                placeholder={pasteHere(fieldDisplays.ipCdiVerifyKey)}
                rules={{
                    required: requiredMessage(fieldDisplays.ipCdiVerifyKey),
                    minLength: lengthRule,
                    maxLength: lengthRule,
                    validate: validateHex(fieldDisplays.ipCdiVerifyKey),
                }}
            />
        </>
    );
}
