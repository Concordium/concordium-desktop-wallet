import React from 'react';
import { useRouteMatch } from 'react-router';
import routes from '~/constants/routes.json';
import {
    AddressBookEntry,
    EncryptedTransfer,
    EncryptedTransferWithMemo,
} from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayMemo from '~/components/DisplayMemo';
import DisplayAddress from '../DisplayAddress';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: EncryptedTransfer | EncryptedTransferWithMemo;
    to?: AddressBookEntry;
    fromName?: string;
    memo?: string;
}

/**
 * Displays an overview of an encrypted transfer.
 * N.B. This can also display an encrypted transfer with memo, but this is done by passing the memo argument.
 */
export default function DisplayEncryptedTransfer({
    transaction,
    fromName,
    to,
    memo,
}: Props) {
    const singleSigTransfer = useRouteMatch(routes.SUBMITTRANSFER);
    return (
        <>
            <p className={styles.title}>From Account:</p>
            <p className={styles.name}>{fromName}</p>
            <DisplayAddress
                address={transaction.sender}
                lineClassName={styles.address}
            />
            <p className={styles.title}>To Account:</p>
            <p className={styles.name}>{to?.name}</p>
            <DisplayAddress
                address={transaction.payload.toAddress}
                lineClassName={styles.address}
            />
            {to?.note && <p className={styles.note}>Note: {to?.note}</p>}
            <p className={styles.title}>Amount:</p>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.plainTransferAmount)}
            </p>
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            <DisplayMemo memo={memo} />
            {Boolean(singleSigTransfer) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
