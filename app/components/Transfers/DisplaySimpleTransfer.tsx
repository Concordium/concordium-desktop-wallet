import React from 'react';
import { useRouteMatch } from 'react-router';
import { AddressBookEntry, SimpleTransfer } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import routes from '~/constants/routes.json';
import DisplayFee from '~/components/DisplayFee';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayMemo from '~/components/DisplayMemo';
import DisplayAddress from '../DisplayAddress';

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
    const singleSigTransfer = useRouteMatch(routes.SUBMITTRANSFER);
    return (
        <>
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
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.amount)}
            </p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <DisplayMemo memo={transaction.payload.memo} />
            {Boolean(singleSigTransfer) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
