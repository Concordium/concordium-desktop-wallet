import React from 'react';
import styles from './Accounts.css';

export default function AccountListElement(account, onClick, highlighted) {
    return (
        <div
            onClick={onClick}
            key={account.address}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            {account.status} {account.name}{' '}
            {account.accountNumber === 0 ? '(initial)' : undefined}
        </div>
    );
}
