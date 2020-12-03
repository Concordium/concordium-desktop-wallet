import React from 'react';
import { useSelector } from 'react-redux';
import {
    chosenIdentitySelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';

export default function IdentityView() {
    const identity = useSelector(chosenIdentitySelector);
    console.log(identity);

    if (identity === undefined) {
        return <div />;
    }

    let attributeDom;
    if (identity.status === "confirmed" && identity.attributes) {
        const { chosenAttributes, validTo } = identity.attributes;
        attributeDom = (
            <>
                {`${chosenAttributes.firstName} ${chosenAttributes.lastName}`}{' '}
                {chosenAttributes.idDocIssuer} {validTo}{' '}
                {chosenAttributes.countryOfResidence}{' '}
            </>
        );
    } else {
        attributeDom = (
            <div />
        );
    }

    return (
        <div className={styles.halfPage}>
            <div className={styles.chosenAccount}>
        {' '}
        {identity.status}
        {identity.name}
        {' '}
        {
            attributeDom
        }
            </div>
        </div>
    );
}
