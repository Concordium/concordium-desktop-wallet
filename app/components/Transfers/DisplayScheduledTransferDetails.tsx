import React from 'react';
import { ScheduledTransfer } from '~/utils/types';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import { displayAsGTU } from '~/utils/gtu';
import DisplayFee from '~/components/DisplayFee';
import styles from './transferDetails.module.scss';
import ScheduleList from '~/components/ScheduleList';

interface Props {
    transaction: ScheduledTransfer;
    fromName?: string;
    toName?: string;
}

/**
 * Displays an overview of a scheduledTransfer.
 */
export default function DisplayScheduledTransfer({
    transaction,
    fromName,
    toName,
}: Props) {
    const amount = getScheduledTransferAmount(transaction);
    return (
        <>
            <p className={styles.title}>From Account:</p>
            <p className={styles.name}>{fromName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <p className={styles.title}>To Account:</p>
            <p className={styles.name}>{toName}</p>
            <p className={styles.address}>{transaction.payload.toAddress}</p>
            <p className={styles.title}>Amount:</p>
            <p className={styles.amount}>{displayAsGTU(amount)}</p>
            <DisplayFee transaction={transaction} />
            <p className={styles.title}>Individual Releases:</p>
            <ScheduleList schedule={transaction.payload.schedule} />
        </>
    );
}
