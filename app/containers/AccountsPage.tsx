import React from 'react';
import Accounts from '../components/Accounts';
import AccountView from '../components/AccountView';
import styles from './Pages.css';

export default function AccountsPage() {
    return (
        <div className={styles.splitPage}>
            <Accounts />
            <AccountView />
        </div>
    );
}
