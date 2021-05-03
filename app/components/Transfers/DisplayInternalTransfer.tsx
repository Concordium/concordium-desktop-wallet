import React from 'react';
import {
    TransferToEncrypted,
    TransferToPublic,
    instanceOfTransferToEncrypted,
} from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import styles from './transferDetails.module.scss';

interface Props {
    transaction: TransferToEncrypted | TransferToPublic;
    fromName?: string;
}

function getDetails(transaction: TransferToEncrypted | TransferToPublic) {
    if (instanceOfTransferToEncrypted(transaction)) {
        return {
            title: 'Shield amount',
            amount: transaction.payload.amount,
        };
    }
    return {
        title: 'Unshield amount',
        amount: transaction.payload.transferAmount,
    };
}

/**
 * Displays an overview of an internal transfer (shield/unshield amount).
 */
export default function DisplayInternalTransfer({
    transaction,
    fromName,
}: Props) {
    const transactionDetails = getDetails(transaction);
    return (
        <>
            <h2>{transactionDetails.title}</h2>
            <p className={styles.title}>From Account:</p>
            <p className={styles.name}>{fromName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <p className={styles.title}>Amount:</p>
            <p className={styles.amount}>
                {displayAsGTU(transactionDetails.amount)}
            </p>
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
        </>
    );
}
