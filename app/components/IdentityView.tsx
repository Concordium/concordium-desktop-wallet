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
    const chosenAttributes = identity.attributeList.chosenAttributes;

    return (
        <div className={styles.halfPage}>
            <div className={styles.chosenAccount}>
                {' '}
                {chosenAttributes.firstName + ' ' + chosenAttributes.lastName} {chosenAttributes.idDocIssuer} {identity.attributeList.validTo}{' '}
                {chosenAttributes.countryOfResidence}{' '}
            </div>
        </div>
    );
}
