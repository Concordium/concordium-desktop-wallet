import React from 'react';
import { useRouteMatch } from 'react-router';
import routes from '~/constants/routes.json';
import { AddressBookEntry, ScheduledTransfer } from '~/utils/types';
import {
    getScheduledTransferAmount,
    toReleaseSchedule,
} from '~/utils/transactionHelpers';
import { displayAsGTU } from '~/utils/gtu';
import DisplayFee from '~/components/DisplayFee';
import ScheduleList from '~/components/ScheduleList';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayMemo from './DisplayMemo';
import DisplayAddress from '../DisplayAddress';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: ScheduledTransfer;
    fromName?: string;
    to?: AddressBookEntry;
    memo?: string;
}

/**
 * Displays an overview of a scheduledTransfer.
 * N.B. This can also display a scheduled transfer with memo, but this is done by passing the memo argument.
 */
export default function DisplayScheduledTransfer({
    transaction,
    fromName,
    to,
    memo,
}: Props) {
    const amount = getScheduledTransferAmount(transaction);
    const singleSigTransfer = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <div>
            <h5 className={styles.title}>From Account:</h5>
            <p className={styles.name}>{fromName}</p>
            <DisplayAddress
                address={transaction.sender}
                lineClassName={styles.address}
            />
            <h5 className={styles.title}>To Account:</h5>
            <p className={styles.name}>{to?.name}</p>
            <DisplayAddress
                address={transaction.payload.toAddress}
                lineClassName={styles.address}
            />
            {to?.note && <p className={styles.note}>Note: {to?.note}</p>}
            <h5 className={styles.title}>Amount:</h5>
            <p className={styles.amount}>{displayAsGTU(amount)}</p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <DisplayMemo memo={memo} />
            {Boolean(singleSigTransfer) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
            <h5 className={styles.title}>Individual Releases:</h5>
            <ScheduleList
                schedule={transaction.payload.schedule.map(toReleaseSchedule)}
            />
        </div>
    );
}
