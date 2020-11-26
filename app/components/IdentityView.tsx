import React from 'react';
import { useSelector } from 'react-redux';
import {
    identitiesSelector,
    chosenIdentitySelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';

export default function IdentityView() {
    const identities = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    if (chosenIndex === undefined || chosenIndex >= identities.length) {
        return <div />;
    }

    const identity = identities[chosenIndex];

    return (
        <div className={styles.halfPage}>
            <div className={styles.chosenAccount}>
                {' '}
                {identity.name} {identity.issuer} {identity.expiresAt}{' '}
                {identity.residenceCountry}{' '}
            </div>
        </div>
    );
}
