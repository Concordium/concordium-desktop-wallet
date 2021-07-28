import React from 'react';
import { Validate, ValidationRule } from 'react-hook-form';

import { EqualRecord, AddIdentityProvider, Description } from '~/utils/types';
import { isHex, onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import Form from '~/components/Form';
import { UpdateProps } from '~/utils/transactionTypes';

export type AddIdentityProviderFields = Omit<
    AddIdentityProvider,
    'ipDescription'
> &
    Description;

const cdiKeyLength = 64;
const verifyKeyLength = 9136;

const fieldNames: EqualRecord<AddIdentityProviderFields> = {
    name: 'name',
    url: 'url',
    description: 'description',
    ipIdentity: 'ipIdentity',
    ipVerifyKey: 'ipVerifyKey',
    ipCdiVerifyKey: 'ipCdiVerifyKey',
};

const lengthRule: (length: number) => ValidationRule<number> = (
    length: number
) => ({
    value: length,
    message: 'Specification hash must be 64 characters',
});

const validateHex: Validate = (v: string) =>
    isHex(v) || 'Specification hash must be HEX format';

/**
 * Component for creating an update protocol transaction.
 */
export default function UpdateProtocol({
    defaults,
}: UpdateProps): JSX.Element | null {
    return (
        <>
            <Form.TextArea
                className="body1"
                name={fieldNames.name}
                label="Name:"
                defaultValue={defaults.name || undefined}
                placeholder="Enter the name here"
                rules={{ required: 'Name is required' }}
            />
            <Form.Input
                className="body1"
                name={fieldNames.url}
                defaultValue={defaults.url || undefined}
                label="Provider URL:"
                placeholder="Enter URL"
                rules={{ required: 'URL is required' }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.description}
                label="Description:"
                defaultValue={defaults.description || undefined}
                placeholder="Enter descriptive text about the provider here"
                rules={{ required: 'Description is required' }}
            />
            <Form.Input
                className="body1"
                name={fieldNames.ipIdentity}
                defaultValue={defaults.ipIdentity || undefined}
                label="ipIdentity:"
                placeholder="Enter ipIdentity here"
                rules={{
                    required: 'ipIdentity is required',
                    validate: (v) =>
                        onlyDigitsNoLeadingZeroes(v) ||
                        'Must be a valid number',
                }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.ipVerifyKey}
                defaultValue={defaults.ipVerifyKey || undefined}
                label="Verify Key:"
                placeholder="Paste Verify Key here"
                rules={{
                    required: 'Verify Key is required',
                    minLength: lengthRule(verifyKeyLength),
                    maxLength: lengthRule(verifyKeyLength),
                    validate: validateHex,
                }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.ipCdiVerifyKey}
                defaultValue={defaults.ipCdiVerifyKey || undefined}
                label="Cdi Verify Key:"
                placeholder="Paste Cdi Verify Key here"
                rules={{
                    required: 'Cdi Verify Key is required',
                    minLength: lengthRule(cdiKeyLength),
                    maxLength: lengthRule(cdiKeyLength),
                    validate: validateHex,
                }}
            />
        </>
    );
}
