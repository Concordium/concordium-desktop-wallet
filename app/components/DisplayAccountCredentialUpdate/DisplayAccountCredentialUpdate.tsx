import React from 'react';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import { UpdateAccountCredentials } from '~/utils/types';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import DisplayEstimatedFee from '../DisplayEstimatedFee';

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
            <h5 className="mB0">Account:</h5>
            <h3 className="mV10">{fromName}</h3>
            <p className={styles.address}>{transaction.sender}</p>
            <DisplayEstimatedFee
                className="mT0"
                estimatedFee={transaction.estimatedFee}
            />
            <h5>
                New threshold: <b>{transaction.payload.threshold}</b>
            </h5>
            {removedCredIds.length > 0 ? (
                <>
                    <h5>Removed credentials:</h5>
                    {removedCredIds.map((removedId) => (
                        <p key={removedId} className={styles.credId}>
                            {removedId}
                        </p>
                    ))}
                </>
            ) : null}
            {addedCredentials.length > 0 ? (
                <>
                    <h5>Added credentials:</h5>
                    {addedCredentials.map((addedCredential) => (
                        <p
                            key={addedCredential.value.credId}
                            className={styles.credId}
                        >
                            {addedCredential.note !== undefined && (
                                <>
                                    {addedCredential.note}
                                    <br />
                                </>
                            )}
                            <span className="textFaded">
                                {addedCredential.value.credId}
                            </span>
                        </p>
                    ))}
                </>
            ) : null}
            <DisplayTransactionExpiryTime
                expiryTime={dateFromTimeStamp(transaction.expiry)}
            />
        </>
    );
}
