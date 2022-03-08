import React from 'react';
import { useRouteMatch } from 'react-router';
import routes from '~/constants/routes.json';
import {
    AddressBookEntry,
    EncryptedTransfer,
    EncryptedTransferWithMemo,
} from '~/utils/types';
import { displayAsCcd } from '~/utils/ccd';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import DisplayMemo from './DisplayMemo';
import { DisplayFromAccount, DisplayToAccount } from './DisplayAccount';

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
            <DisplayFromAccount name={fromName} address={transaction.sender} />
            <DisplayToAccount
                name={to?.name}
                note={to?.note}
                address={transaction.payload.toAddress}
            />
            <p className={styles.title}>Amount:</p>
            <p className={styles.amount}>
                {displayAsCcd(transaction.payload.plainTransferAmount)}
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
