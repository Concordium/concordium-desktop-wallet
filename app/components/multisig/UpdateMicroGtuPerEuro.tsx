import React from 'react';
import styles from './Multisignature.css';

export default function UpdateMicroGtuPerEuroRate() {

    return (
        <div className={styles.centering}>
            <div className={styles.subbox}>
                <h3>Transaction Proposal | Transaction Type</h3>
                <hr></hr>
                <div>
                    <h4 className={styles.readonly}>Current MicroGTU Per Euro Rate:</h4>
                    <h2 className={styles.readonly}>€ 1.00 = µǤ 1323</h2>
                </div>
                <div>
                    <h4 className={styles.readonly}>New MicroGTU Per Euro Rate:</h4>
                    <h2 className={styles.readonly}>€ 1.00 = µǤ 1338</h2>
                </div>
            </div>
            <div className={styles.test}>
                <button type="button">Generate Transaction Proposal</button>
            </div>
        </div>
    );
}
