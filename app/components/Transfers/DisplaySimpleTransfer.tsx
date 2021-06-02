import React from 'react';
import { AddressBookEntry, SimpleTransfer } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayFee from '~/components/DisplayFee';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import styles from './transferDetails.module.scss';

interface Props {
    transaction: SimpleTransfer;
    fromName?: string;
    to?: AddressBookEntry;
}

/**
 * Displays an overview of a simple transfer.
 */
export default function DisplaySimpleTransfer({
    transaction,
    fromName,
    to,
}: Props) {
    return (
        <>
            <h5 className={styles.title}>From Account:</h5>
            <p className={styles.name}>{fromName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <h5 className={styles.title}>To Account:</h5>
            <p className={styles.name}>{to?.name}</p>
            <p className={styles.address}>{transaction.payload.toAddress}</p>
            {to?.note && <p className={styles.note}>Note: {to?.note}</p>}
            <h5 className={styles.title}>Amount:</h5>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.amount)}
            </p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <DisplayTransactionExpiryTime
                expiryTime={dateFromTimeStamp(transaction.expiry)}
            />
        </>
    );
}
