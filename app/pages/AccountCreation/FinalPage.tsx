import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import routes from '~/constants/routes.json';
import { accountsSelector } from '~/features/AccountSlice';
import AccountListElement from '~/components/AccountListElement';

import styles from './AccountCreation.module.scss';
import Button from '~/cross-app-components/Button';

interface Props {
    accountName: string;
}

export default function AccountCreationFinal({
    accountName,
}: Props): JSX.Element | null {
    const accounts = useSelector(accountsSelector);

    if (accounts === undefined) {
        return null;
    }

    const account = accounts.find((acc) => acc.name === accountName);

    if (account === undefined) {
        throw new Error(
            'Newly created account not found. This should not happen'
        );
    }

    return (
        <div className={styles.singleColumn}>
            <h2 className={styles.header}>Your account has been submitted</h2>
            <div
                className={clsx(
                    styles.singleColumnContent,
                    'flexColumn',
                    'flexChildFill'
                )}
            >
                <p>
                    That was it! Now you just have to wait for your account to
                    be finalized on the block-chain.
                </p>
                <div className="mT50 flexChildFill flexColumn justifySpaceBetween">
                    <AccountListElement
                        account={account}
                        className={clsx(styles.card, 'marginCenter')}
                    />
                    <Button
                        className={clsx(styles.button, 'marginCenter')}
                        as={Link}
                        to={routes.ACCOUNTS}
                    >
                        Finished!
                    </Button>
                </div>
            </div>
        </div>
    );
}
