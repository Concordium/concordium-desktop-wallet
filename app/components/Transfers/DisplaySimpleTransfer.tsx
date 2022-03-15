import React from 'react';
import { useRouteMatch } from 'react-router';
import { AddressBookEntry, SimpleTransfer } from '~/utils/types';
import { displayAsCcd } from '~/utils/ccd';
import routes from '~/constants/routes.json';
import DisplayFee from '~/components/DisplayFee';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayMemo from './DisplayMemo';
import { DisplayFromAccount, DisplayToAccount } from './DisplayAccount';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: SimpleTransfer;
    fromName?: string;
    to?: AddressBookEntry;
    memo?: string;
}

/**
 * Displays an overview of a simple transfer.
 * N.B. This can also display a simple transfer with memo, but this is done by passing the memo argument.
 */
export default function DisplaySimpleTransfer({
    transaction,
    fromName,
    to,
    memo,
}: Props) {
    const singleSigTransfer = useRouteMatch(routes.SUBMITTRANSFER);
    return (
        <>
            <DisplayFromAccount name={fromName} address={transaction.sender} />
            <DisplayToAccount
                name={to?.name}
                note={to?.note}
                address={transaction.payload.toAddress}
            />
            <h5 className={styles.title}>Amount:</h5>
            <p className={styles.amount}>
                {displayAsCcd(transaction.payload.amount)}
            </p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <DisplayMemo memo={memo} />
            {Boolean(singleSigTransfer) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
