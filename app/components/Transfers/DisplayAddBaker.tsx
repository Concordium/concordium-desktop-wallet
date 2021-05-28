import React from 'react';
import { AddBaker } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayFee from '~/components/DisplayFee';
import { useAccountName } from '~/utils/hooks';
import styles from './transferDetails.module.scss';
import PublicKey from '~/pages/multisig/common/PublicKey/PublicKey';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';

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
            <h5 className={styles.title}>From Account:</h5>
            <p className={styles.name}>{senderName}</p>
            <p className={styles.address}>{transaction.sender}</p>
            <h5 className={styles.title}>Staked amount:</h5>
            <p className={styles.amount}>
                {displayAsGTU(transaction.payload.bakingStake)}
            </p>
            <DisplayFee className={styles.fee} transaction={transaction} />
            <h5 className={styles.title}>Restake earnings:</h5>
            <p className={styles.amount}>
                {transaction.payload.restakeEarnings ? 'Yes' : 'No'}
            </p>
            <h5 className={styles.title}>Public keys:</h5>
            <PublicKey
                name="Election verify key"
                publicKey={transaction.payload.electionVerifyKey}
            />
            <PublicKey
                name="Signature verify key"
                publicKey={transaction.payload.signatureVerifyKey}
            />
            <PublicKey
                name="Aggregation verify key"
                publicKey={transaction.payload.aggregationVerifyKey}
            />
            <DisplayTransactionExpiryTime
                expiryTime={dateFromTimeStamp(transaction.expiry)}
            />
        </>
    );
}
