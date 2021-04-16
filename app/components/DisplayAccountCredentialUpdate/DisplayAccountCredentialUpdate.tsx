import React from 'react';
import { UpdateAccountCredentials } from '~/utils/types';
import styles from './DisplayAccountCredentialUpdate.module.scss';

interface Props {
    transaction: UpdateAccountCredentials;
    fromName?: string;
}

/**
 * Displays an overview of a credential update transaction.
 */
export default function DisplayAccountCredentialUpdate({
    transaction,
    fromName,
}: Props) {
    const { addedCredentials, removedCredIds } = transaction.payload;
    return (
        <>
            <h5>Account:</h5>
            <h3>{fromName}</h3>
            <p className={styles.address}>{transaction.sender}</p>
            <h5>
                New Threshold: <b>{transaction.payload.threshold}</b>
            </h5>
            {removedCredIds.length > 0 ? (
                <>
                    <h5>Removed Credentials:</h5>
                    {removedCredIds.map((removedId) => (
                        <p key={removedId} className={styles.credId}>
                            {removedId}
                        </p>
                    ))}
                </>
            ) : null}
            {addedCredentials.length > 0 ? (
                <>
                    <h5>Added Credentials:</h5>
                    {addedCredentials.map((addedCredential) => (
                        <p
                            key={addedCredential.value.credId}
                            className={styles.credId}
                        >
                            {addedCredential.value.credId}
                        </p>
                    ))}
                </>
            ) : null}
        </>
    );
}
