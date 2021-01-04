import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

import { accountsSelector } from '../features/AccountSlice';

import accountListElement from './AccountListElement';
import styles from './IdentyIssuance.css';

export default function AccountCreationFinal(accountName): JSX.Element {
    const accounts = useSelector(accountsSelector);

    if (accounts === undefined) {
        return <div />;
    }

    const account = accounts.filter((acc) => acc.name === accountName)[0];

    return (
        <div>
            <h1>header</h1>
            <p>
                That was it! Now you just have to wait for your account to be
                finalized on the block-chain
            </p>
            <div className={styles.flex}>
                {accountListElement(account, () => {}, false)}
            </div>
            <Link to={routes.ACCOUNTS}>
                <button>Finished</button>
            </Link>
        </div>
    );
}
