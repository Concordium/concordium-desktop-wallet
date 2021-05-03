import React from 'react';
import { AddBaker } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { useAccountName } from '~/utils/hooks';
import styles from './transferDetails.module.scss';

interface Props {
    transaction: AddBaker;
}

/**
 * Displays an overview of an Add-Baker-Transaction.
 */
export default function DisplayAddBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    return (
        <>
            <p className={styles.title}>From Account:</p>
            <p className={styles.name}>{senderName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <p className={styles.title}>Staked amount:</p>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.bakingStake)}
            </p>
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            <p className={styles.title}>Restake earnings:</p>
            <p className={styles.amount}>
                {transaction.payload.restakeEarnings ? 'Yes' : 'No'}
            </p>
        </>
    );
}
