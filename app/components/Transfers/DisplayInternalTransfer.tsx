import React from 'react';
import { useRouteMatch } from 'react-router';
import routes from '~/constants/routes.json';
import {
    TransferToEncrypted,
    TransferToPublic,
    instanceOfTransferToEncrypted,
} from '~/utils/types';
import { displayAsCcd } from '~/utils/ccd';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import { DisplayFromAccount } from './DisplayAccount';

import styles from './transferDetails.module.scss';

interface Props {
    transaction: TransferToEncrypted | TransferToPublic;
    fromName?: string;
}

function getDetails(transaction: TransferToEncrypted | TransferToPublic) {
    if (instanceOfTransferToEncrypted(transaction)) {
        return {
            title: 'Shield amount',
            amount: transaction.payload.amount,
        };
    }
    return {
        title: 'Unshield amount',
        amount: transaction.payload.transferAmount,
    };
}

/**
 * Displays an overview of an internal transfer (shield/unshield amount).
 */
export default function DisplayInternalTransfer({
    transaction,
    fromName,
}: Props) {
    const transactionDetails = getDetails(transaction);
    const singleSigTransfer = useRouteMatch(routes.SUBMITTRANSFER);
    return (
        <>
            <DisplayFromAccount name={fromName} address={transaction.sender} />
            <h5 className={styles.title}>Amount:</h5>
            <p className={styles.amount}>
                {displayAsCcd(transactionDetails.amount)}
            </p>
            <DisplayEstimatedFee
                className={styles.fee}
                estimatedFee={transaction.estimatedFee}
            />
            {Boolean(singleSigTransfer) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
