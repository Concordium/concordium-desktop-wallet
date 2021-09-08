import React from 'react';
import { useRouteMatch } from 'react-router';
import routes from '~/constants/routes.json';
import { AddressBookEntry, EncryptedTransfer } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayAddress from '../DisplayAddress';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: EncryptedTransfer;
    to?: AddressBookEntry;
    fromName?: string;
}

/**
 * Displays an overview of an encrypted transfer.
 */
export default function DisplayEncryptedTransfer({
    transaction,
    fromName,
    to,
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
            {Boolean(singleSigTransfer) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
