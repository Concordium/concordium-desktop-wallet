import React from 'react';
import styles from './Accounts.css';
import { AddressBookEntry } from '../utils/types';

interface Props {
    entry: AddressBookEntry;
    isChosen: boolean;
    onClick(): void;
}

export default function AddressBookListElement({
    entry,
    isChosen,
    onClick,
}: Props) {
    return (
        <div
            key={entry.address}
            role="button"
            tabIndex={0}
            onClick={onClick}
            className={`${styles.accountListElement} ${
                isChosen ? styles.chosenAccountListElement : null
            }`}
        >
            {entry.name}
        </div>
    );
}
