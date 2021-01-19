import React from 'react';
import AccountList from '../components/AccountList';
import AccountView from '../components/AccountView';
import styles from './Pages.css';

export default function AccountsPage() {
    return (
        <div className={styles.splitPage}>
            <AccountList />
            <AccountView />
        </div>
    );
}
