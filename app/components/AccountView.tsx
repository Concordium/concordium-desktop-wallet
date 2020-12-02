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
    const account = accountList[chosenIndex];

    if (
        account === undefined ||
        chosenIndex === undefined ||
        chosenIndex >= accountList.length
    ) {
        return <div />;
    }

    return (
        <div className={styles.halfPage}>
            <div className={styles.chosenAccount}>
                {' '}
                {account.name} {account.address}{' '}
            </div>
        </div>
    );
}
