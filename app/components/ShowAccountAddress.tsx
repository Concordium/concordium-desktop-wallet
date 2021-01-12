import React from 'react';
import { Account } from '../utils/types';
import styles from './Transaction.css';
import CopyButton from './CopyButton';

interface Props {
    account: Account;
    returnFunction: () => void;
}

// TODO display QR?

export default function ShowAccountAddress({ account, returnFunction }: Props) {
    return (
        <div className={styles.centerText}>
            <h2> Address </h2>
            <button onClick={returnFunction} type="submit">
                x
            </button>

            {account.address}
            <CopyButton value={account.address} />
        </div>
    );
}
