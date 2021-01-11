import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { accountsSelector } from '../features/AccountSlice';
import { identitiesSelector } from '../features/IdentitySlice';
import AccountListElement from './AccountListElement';
import IdentityListElement from './IdentityListElement';
import styles from './IdentyIssuance.css';

interface Props {
    identityName: string;
    accountName: string;
}

export default function IdentityIssuanceFinal(
    identityName,
    accountName
): JSX.Element {
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);

    const account = accounts.filter((acc) => acc.name === accountName)[0];
    const identity = identities.filter((id) => id.name === identityName)[0];

    if (account === undefined || identity === undefined) {
        return <div />;
    }

    return (
        <div>
            <h1>header</h1>
            <p>text</p>
            <div className={styles.flex}>
                <IdentityListElement
                    identity={identity}
                    onClick={() => {}}
                    highlighted
                    index={0}
                />
                {AccountListElement(account, () => {}, true)}
            </div>
            <Link to={routes.IDENTITIES}>
                <button type="button">Finished</button>
            </Link>
        </div>
    );
}
