import React from 'react';
import styles from './Accounts.css';

export default function IdentityListElement(
    identity,
    onClick,
    highlighted
): JSX.Element {
    return (
        <div
            onClick={onClick}
            key={identity.signature}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            {identity.provider} {identity.status} {identity.name}
        </div>
    );
}
