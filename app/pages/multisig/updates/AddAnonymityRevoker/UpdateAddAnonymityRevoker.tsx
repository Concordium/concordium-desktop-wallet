import React, { useMemo } from 'react';
import { Validate, ValidationRule } from 'react-hook-form';

import { EqualRecord, AddAnonymityRevoker, Description } from '~/utils/types';
import { isHex, onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import Form from '~/components/Form';
import { UpdateProps } from '~/utils/transactionTypes';
import { useAnonymityRevokers } from '~/utils/dataHooks';

export type AddAnonymityRevokerFields = Omit<
    AddAnonymityRevoker,
    'arDescription'
> &
    Description;

const publicKeyLength = 192;

const fieldNames: EqualRecord<AddAnonymityRevokerFields> = {
    name: 'name',
    url: 'url',
    description: 'description',
    arIdentity: 'arIdentity',
    arPublicKey: 'arPublicKey',
};

const lengthRule: (length: number) => ValidationRule<number> = (
    length: number
) => ({
    value: length,
    message: `The key must be ${length} characters`,
});

const validateHex: Validate = (v: string) =>
    isHex(v) || 'The key must be HEX format';

/**
 * Component for creating an addIdentityProvider transaction.
 */
export default function UpdateAddAnonymityRevoker({
    defaults,
}: UpdateProps): JSX.Element | null {
    const anonymityRevokers = useAnonymityRevokers();
    const existingIdentifiers = useMemo(
        () => anonymityRevokers.map((revoker) => revoker.arIdentity.toString()),
        [anonymityRevokers]
    );

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
                label="URL:"
                placeholder="Enter the URL here"
                rules={{ required: 'URL is required' }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.description}
                defaultValue={defaults.description || undefined}
                label="Description:"
                placeholder="Enter description of the provider here"
            />
            <Form.Input
                className="body1"
                name={fieldNames.arIdentity}
                defaultValue={defaults.arIdentity || undefined}
                label="arIdentity:"
                placeholder="Enter arIdentity here"
                rules={{
                    required: 'arIdentity is required',
                    validate: {
                        mustBeANumber: (v) =>
                            onlyDigitsNoLeadingZeroes(v) ||
                            'Must be a valid number',
                        mayNotBeUsed: (v) =>
                            !existingIdentifiers.includes(v) ||
                            'This arIdentity is already in use',
                    },
                }}
            />
            <Form.TextArea
                className="body1"
                name={fieldNames.arPublicKey}
                defaultValue={defaults.arPublicKey || undefined}
                label="Public Key:"
                placeholder="Paste Public Key here"
                rules={{
                    required: 'Public Key is required',
                    minLength: lengthRule(publicKeyLength),
                    maxLength: lengthRule(publicKeyLength),
                    validate: validateHex,
                }}
            />
        </>
    );
}
