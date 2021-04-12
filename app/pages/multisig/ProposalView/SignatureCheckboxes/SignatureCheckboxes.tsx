import React from 'react';
import Form from '~/components/Form';
import {
    UpdateInstructionSignature,
    TransactionCredentialSignature,
    instanceOfUpdateInstructionSignature,
} from '~/utils/types';

import styles from './SignatureCheckboxes.module.scss';

export const getCheckboxName = (i: number) => `${i}`;

function getSignature(
    signature: TransactionCredentialSignature | UpdateInstructionSignature
) {
    if (instanceOfUpdateInstructionSignature(signature)) {
        return signature.signature.substring(0, 16);
    }
    // TODO: Remove assumption that a credential only has 1 signature
    return signature[0].toString('hex').substring(0, 16);
}

interface SignatureCheckboxProps {
    signature:
        | TransactionCredentialSignature
        | UpdateInstructionSignature
        | undefined;
    name: string;
}

function SignatureCheckbox({
    signature,
    name,
}: SignatureCheckboxProps): JSX.Element {
    const label = signature ? (
        <div className={styles.signedCheckoxLabel}>
            Signed
            <div>
                {getSignature(signature)}
                ...
            </div>
        </div>
    ) : (
        'Awaiting signature'
    );

    return (
        <Form.Checkbox
            name={name}
            className={styles.checkbox}
            disabled
            defaultChecked={!!signature}
            size="large"
            rules={{ required: 'Missing signature' }}
        >
            {label}
        </Form.Checkbox>
    );
}

interface SignatureCheckboxesProps {
    threshold: number;
    signatures: TransactionCredentialSignature[] | UpdateInstructionSignature[];
}

export default function SignatureCheckboxes({
    threshold,
    signatures,
}: SignatureCheckboxesProps): JSX.Element {
    const thresholdArray = new Array(threshold).fill(0);

    return (
        <>
            {thresholdArray.map((_, i) => (
                <SignatureCheckbox
                    signature={signatures[i]}
                    name={getCheckboxName(i)}
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                />
            ))}
        </>
    );
}
