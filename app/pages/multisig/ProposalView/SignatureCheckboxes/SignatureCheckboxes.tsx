import React from 'react';
import Form from '~/components/Form';

import styles from './SignatureCheckboxes.module.scss';

export const getCheckboxName = (i: number) => `${i}`;

interface SignatureCheckboxProps {
    signature: string | undefined;
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
                {signature.substring(0, 16)}
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
            rules={{ required: true }}
        >
            {label}
        </Form.Checkbox>
    );
}

interface SignatureCheckboxesProps {
    threshold: number;
    signatures: string[];
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
