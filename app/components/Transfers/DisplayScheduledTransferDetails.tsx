import React from 'react';
import { AddressBookEntry, ScheduledTransfer } from '~/utils/types';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import { displayAsGTU } from '~/utils/gtu';
import DisplayFee from '~/components/DisplayFee';
import styles from './transferDetails.module.scss';
import ScheduleList from '~/components/ScheduleList';

interface Props {
    transaction: ScheduledTransfer;
    fromName?: string;
    to?: AddressBookEntry;
}

/**
 * Displays an overview of a scheduledTransfer.
 */
export default function DisplayScheduledTransfer({
    transaction,
    fromName,
    to,
}: Props) {
    const amount = getScheduledTransferAmount(transaction);
    return (
        <div>
            <h5 className={styles.title}>From Account:</h5>
            <p className={styles.name}>{fromName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <h5 className={styles.title}>To Account:</h5>
            <p className={styles.name}>{to?.name}</p>
            <p className={styles.address}>{transaction.payload.toAddress}</p>
            {to?.note && <p className={styles.note}>Note: {to?.note}</p>}
            <h5 className={styles.title}>Amount:</h5>
            <p className={styles.amount}>{displayAsGTU(amount)}</p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <h5 className={styles.title}>Individual Releases:</h5>
            <ScheduleList schedule={transaction.payload.schedule} />
        </div>
    );
}
