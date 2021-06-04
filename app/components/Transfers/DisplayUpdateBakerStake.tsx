import React from 'react';
import { UpdateBakerStake } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { useAccountName } from '~/utils/dataHooks';
import styles from './transferDetails.module.scss';
import { displayAsGTU } from '~/utils/gtu';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';

interface Props {
    transaction: UpdateBakerStake;
}

/**
 * Displays an overview of an Update-Baker-Stake-Transaction.
 */
export default function DisplayUpdateBakerStake({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    return (
        <>
            <p className={styles.title}>From Account:</p>
            <p className={styles.name}>{senderName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <p className={styles.title}>New staked amount:</p>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.stake)}
            </p>
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            <DisplayTransactionExpiryTime
                expiryTime={dateFromTimeStamp(transaction.expiry)}
            />
        </>
    );
}
