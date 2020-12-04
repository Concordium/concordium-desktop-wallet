import React from 'react';
import { useSelector } from 'react-redux';
import {
    accountsSelector,
    chosenAccountSelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';

export default function AccountView() {
    const accountList = useSelector(accountsSelector);
    const chosenIndex = useSelector(chosenAccountSelector);

    return (
        <div className={styles.halfPage}>
            <div className={styles.chosenAccount}>
                {' '}
                {accountList[chosenIndex]}{' '}
            </div>
        </div>
    );
}
