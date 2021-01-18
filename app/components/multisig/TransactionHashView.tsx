import React from 'react';
import styles from './Multisignature.css';

// TODO Compute identicon for the hash and display it.

interface Props {
    transactionHash: string
}

/**
 * Component that displays the hash and an identicon of the hash so that a user
 * can verify the integrity of a received transaction before signing it.
 */
export default function TransactionHashView({ transactionHash }: Props) {
    return (
        <div className={styles.twocolumn}>
            <h3>Transaction Identicon</h3>
            <p>Transaction hash {transactionHash}</p>
        </div>
    );
}
