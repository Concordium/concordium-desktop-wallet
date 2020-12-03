import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

import {
    chosenAccountSelector,
    chosenIdentitySelector,
} from '../features/accountsSlice';

import accountListElement from './AccountListElement';
import identityListElement from './IdentityListElement';
import styles from './IdentyIssuance.css';

export default function IdentityIssuanceFinal(): JSX.Element {
    const account =  useSelector(chosenAccountSelector);
    const identity = useSelector(chosenIdentitySelector);

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
