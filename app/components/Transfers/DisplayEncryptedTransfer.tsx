import React from 'react';
import { EncryptedTransfer } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import styles from './transferDetails.module.scss';

interface Props {
    transaction: EncryptedTransfer;
    fromName?: string;
    toName?: string;
}

/**
 * Displays an overview of a simple transfer.
 */
export default function DisplaySimpleTransfer({
    transaction,
    fromName,
    toName,
}: Props) {
    return (
        <>
            <p className={styles.title}>From Account:</p>
            <p className={styles.name}>{fromName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <p className={styles.title}>To Account:</p>
            <p className={styles.name}>{toName}</p>
            <p className={styles.address}>{transaction.payload.toAddress}</p>
            <p className={styles.title}>Amount:</p>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.plainTransferAmount)}
            </p>
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
        </>
    );
}
