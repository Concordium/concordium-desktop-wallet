import React from 'react';
import { UpdateBakerKeys } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { useAccountName } from '~/utils/hooks';
import styles from './transferDetails.module.scss';
import PublicKey from '~/pages/multisig/common/PublicKey/PublicKey';

interface Props {
    transaction: UpdateBakerKeys;
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
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            <p className={styles.title}>Public keys:</p>
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
        </>
    );
}
