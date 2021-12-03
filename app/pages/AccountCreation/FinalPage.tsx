import React from 'react';
import { LocationDescriptorObject } from 'history';
import { useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { accountsSelector } from '~/features/AccountSlice';
import AccountCard from '~/components/AccountCard';

import styles from './AccountCreation.module.scss';
import Button from '~/cross-app-components/Button';

interface Props {
    location: LocationDescriptorObject<string>;
}

export default function AccountCreationFinal({
    location,
}: Props): JSX.Element | null {
    const address = location.state;

    const accounts = useSelector(accountsSelector);

    if (accounts === undefined) {
        return null;
    }

    const account = accounts.find((acc) => acc.address === address);

    if (account === undefined) {
        window.log.warn(`Account Creation final page account was undefined`);
        return <Redirect to={routes.ACCOUNTS} />;
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
                    <AccountCard
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
