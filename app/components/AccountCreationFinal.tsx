import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

import { chosenAccountSelector } from '../features/AccountSlice';

import accountListElement from './AccountListElement';
import styles from './IdentyIssuance.css';

export default function IdentityIssuanceFinal(): JSX.Element {
    const account = useSelector(chosenAccountSelector);

    if (account === undefined) {
        return <div />;
    }

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
            <Link to={routes.IDENTITIES}>
                <button>Finished</button>
            </Link>
        </div>
    );
}
