import React from 'react';
import styles from './Accounts.css';
import { Identity } from '../utils/types';

interface Props {
    identity: Identity;
    onClick?: () => void;
    highlighted?: boolean;
    index: number;
}

function IdentityListElement({
    identity,
    onClick,
    highlighted,
    index,
}: Props): JSX.Element {
    return (
        <div
            onClick={onClick}
            key={identity.name}
            tabIndex={index}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            {JSON.parse(identity.identityProvider).ipInfo.ipDescription.name}{' '}
            {identity.status} {identity.name}
        </div>
    );
}

IdentityListElement.defaultProps = {
    onClick: undefined,
    highlighted: false,
};

export default IdentityListElement;
