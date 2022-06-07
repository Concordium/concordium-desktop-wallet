import React from 'react';
import { useRouteMatch } from 'react-router';
import routes from '~/constants/routes.json';
import { AddressBookEntry, ScheduledTransfer } from '~/utils/types';
import {
    getScheduledTransferAmount,
    toReleaseSchedule,
} from '~/utils/transactionHelpers';
import { displayAsCcd } from '~/utils/ccd';
import DisplayFee from '~/components/DisplayFee';
import ScheduleList from '~/components/ScheduleList';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayMemo from './DisplayMemo';
import { DisplayFromAccount, DisplayToAccount } from './DisplayAccount';

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
            <DisplayFromAccount name={fromName} address={transaction.sender} />
            <DisplayToAccount
                name={to?.name}
                note={to?.note}
                address={transaction.payload.toAddress}
            />
            <h5 className={styles.title}>Amount:</h5>
            <p className={styles.amount}>{displayAsCcd(amount)}</p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <DisplayMemo memo={memo} />
            {Boolean(singleSigTransfer) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
            <h5 className={styles.title}>Individual releases:</h5>
            <ScheduleList
                className={styles.value}
                schedule={transaction.payload.schedule.map(toReleaseSchedule)}
            />
        </div>
    );
}
