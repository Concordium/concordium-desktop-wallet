import React from 'react';
import { useSelector } from 'react-redux';
import { accountsSelector } from '../features/accountsSlice';
import styles from './Accounts.css';
import accountListElement from './AccountListElement';

export default function AccountList() {
    const accounts = useSelector(accountsSelector);

    return (
        <div className={styles.halfPage}>
            <div className={styles.accountList}>
                {accounts.map((account, i) => accountListElement(account, i))}
            </div>
        </div>
    );
}
