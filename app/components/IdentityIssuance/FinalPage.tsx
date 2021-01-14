import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { accountsSelector } from '../../features/AccountSlice';
import { identitiesSelector } from '../../features/IdentitySlice';
import AccountListElement from '../AccountListElement';
import IdentityListElement from '../IdentityListElement';
import styles from './IdentityIssuance.css';

interface Props {
    identityName: string;
    accountName: string;
}

export default function IdentityIssuanceFinal({
    identityName,
    accountName,
}: Props): JSX.Element {
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);

    const account = accounts.find((acc) => acc.name === accountName);
    const identity = identities.find((id) => id.name === identityName);

    if (account === undefined || identity === undefined) {
        return null;
    }

    return (
        <div>
            <h1>Your request is being finished by the provider</h1>
            <p>
                While the identity provider is verifying your identity and
                submitting your initial account, you can see an overview here.
                Once finished by the provider, you can start using both.
            </p>
            <div className={styles.flex}>
                <IdentityListElement
                    identity={identity}
                    onClick={() => {}}
                    highlighted
                    index={0}
                />
                <AccountListElement
                    account={account}
                    onClick={() => {}}
                    highlighted
                />
            </div>
            <Link to={routes.IDENTITIES}>
                <button type="button">Finished!</button>
            </Link>
        </div>
    );
}
