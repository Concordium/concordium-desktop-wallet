import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';

import { accountsSelector } from '../../features/AccountSlice';

import AccountListElement from '../AccountListElement';

interface Props {
    accountName: string;
}

export default function AccountCreationFinal({
    accountName,
}: Props): JSX.Element {
    const accounts = useSelector(accountsSelector);

    if (accounts === undefined) {
        return null;
    }

    const account = accounts.find((acc) => acc.name === accountName);

    return (
        <div>
            <h1>Your account has been submitted</h1>
            <p>
                That was it! Now you just have to wait for your account to be
                finalized on the block-chain.
            </p>
            <AccountListElement
                account={account}
                highlighted={false}
                index={0}
            />
            <Link to={routes.ACCOUNTS}>
                <button type="button">Finished</button>
            </Link>
        </div>
    );
}
