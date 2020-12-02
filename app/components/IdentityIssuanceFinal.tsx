import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

import {
    accountsSelector,
    chosenAccountSelector,
    identitiesSelector,
    chosenIdentitySelector,
} from '../features/accountsSlice';

import accountListElement from './AccountListElement';
import identityListElement from './IdentityListElement';
import styles from './IdentyIssuance.css';

export default function IdentityIssuanceFinal(): JSX.Element {
    const accounts = useSelector(accountsSelector);
    const accountIndex = useSelector(chosenAccountSelector);
    const account = accounts[accountIndex];

    const identities = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);
    const identity = identities[chosenIndex];

    if (account === undefined || identity === undefined) {
        return <div />;
    }

    return (
        <div>
            <h1>header</h1>
            <p>text</p>
            <div className={styles.flex}>
                {identityListElement(identity, () => {}, true)}
                {accountListElement(account, () => {}, true)}
            </div>
            <Link to={routes.IDENTITIES}>
                <button>Finished</button>
            </Link>
        </div>
    );
}
