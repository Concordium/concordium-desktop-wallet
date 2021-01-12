import React from 'react';
import styles from './Accounts.css';

interface Props {
    left: string;
    right: string;
}

export default function sidedText({ left, right }: Props) {
    return (
        <div className={styles.line}>
            <p className={styles.leftAlignedText}>{left}</p>
            <p className={styles.rightAlignedText}>{right}</p>
        </div>
    );
}
