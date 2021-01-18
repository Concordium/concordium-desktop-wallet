import React from 'react';
import styles from './Multisignature.css';
import { UpdateInstruction } from './UpdateMicroGtuPerEuro';

interface Props {
    updateInstruction: UpdateInstruction
}

/**
 * Component that displays the details of a transaction in a human readable way.
 */
export default function TransactionDetails({ updateInstruction }: Props) {
    return (
        <div className={styles.twocolumn}>
            <h3>Transaction overview</h3>{JSON.stringify(updateInstruction.payload)}
        </div>
    );
}
