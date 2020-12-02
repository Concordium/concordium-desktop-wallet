import React from 'react';
import styles from './Accounts.css';

export default function AccountListElement(identity, onClick, highlighted) {
    return (
        <div
            onClick={onClick}
            key={identity.signature}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            {identity.attributeList.chosenAttributes.firstName}
        </div>
    );
}
