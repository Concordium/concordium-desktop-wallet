import React from 'react';
import styles from './Accounts.css';

export default function IdentityListElement(identity, onClick, highlighted) {
    return (
        <div
            onClick={onClick}
            key={identity.signature}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            {identity.status}
            {identity.attributeList.chosenAttributes.firstName}
        </div>
    );
}
