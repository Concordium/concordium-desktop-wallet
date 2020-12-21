import React from 'react';
import styles from './Accounts.css';

export default function AddressBookListElement(entry, isChosen, onClick) {
    return (
        <div
            key={entry.address}
            role="button"
            tabIndex={0}
            onClick={() => onClick()}
            className={`${styles.accountListElement} ${
                isChosen ? styles.chosenAccountListElement : null
            }`}
        >
            {entry.name}
        </div>
    );
}
