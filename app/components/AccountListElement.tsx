import React from 'react';
import styles from './Accounts.css';
import { Account } from '../utils/types';

interface Props {
    account: Account;
    onClick: () => void;
    highlighted: boolean;
    index: number;
}

export default function AccountListElement({
    account,
    onClick,
    highlighted,
    index,
}: Props): JSX.Element {
    return (
        <div
            onClick={onClick}
            tabIndex={index}
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
