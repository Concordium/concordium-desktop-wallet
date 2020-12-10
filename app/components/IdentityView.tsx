import React from 'react';
import { useSelector } from 'react-redux';
import { identitiesSelector, chosenIdentitySelector } from '../features/IdentitySlice';
import { Identity } from '../utils/types';
import styles from './Identity.css';

export default function IdentityView() {

    const identities: Identity[] = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    if (chosenIndex === undefined || chosenIndex >= identities.length) {
        return <div />;
    }

    const identity = identities[chosenIndex];

    return (
        <div className={styles.halfPage}>
            <div className={styles.identityListElement}>
                {' '}
                {identity.name}
            </div>
        </div>
    );
}
