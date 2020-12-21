import React from 'react';
import { useSelector } from 'react-redux';
import { chosenAccountSelector } from '../features/AccountSlice';
import styles from './Accounts.css';

export default function AccountView() {
    const account = useSelector(chosenAccountSelector);

    if (account === undefined) {
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
