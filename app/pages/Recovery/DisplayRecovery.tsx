import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    accountsInfoSelector,
    loadAccountInfos,
} from '~/features/AccountSlice';
import { walletIdSelector } from '~/features/WalletSlice';
import { identitiesSelector } from '~/features/IdentitySlice';
import { Account } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import CardList from '~/cross-app-components/CardList';
import { Status } from './util';

import styles from './Recovery.module.scss';

interface Props {
    status?: Status;
    recoveredAccounts: Account[][];
}

/**
 * Column, which displays the recovered accounts and the current status.
 */
export default function DisplayRecovery({ status, recoveredAccounts }: Props) {
    const dispatch = useDispatch();
    const accountsInfo = useSelector(accountsInfoSelector);
    const identities = useSelector(identitiesSelector);
    const walletId = useSelector(walletIdSelector);

    useEffect(() => {
        if (recoveredAccounts.length) {
            loadAccountInfos(
                recoveredAccounts[recoveredAccounts.length - 1],
                dispatch,
                false
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recoveredAccounts.length]);

    return (
        <div className={styles.recoveredDiv}>
            {status && (
                <>
                    <p className="bodyEmphasized textLeft">
                        Identity index {recoveredAccounts.length}:
                    </p>
                    <p className="textLeft">{status}</p>
                </>
            )}
            {recoveredAccounts.map((accounts, index) => {
                const identityNumber = recoveredAccounts.length - index - 1;
                const identity = identities.find(
                    (i) =>
                        i.identityNumber === identityNumber &&
                        i.walletId === walletId
                );
                return (
                    <>
                        <p className="bodyEmphasized textLeft">
                            Identity index {identityNumber}:{' '}
                            {identity ? `(${identity.name})` : null}
                        </p>
                        <p className="textLeft">
                            Done: Found {accounts.length}{' '}
                            {identity ? 'additional ' : null}account
                            {accounts.length === 1 || 's'}.
                        </p>
                        <CardList>
                            {accounts.map((account) => (
                                <AccountCard
                                    key={account.address}
                                    accountInfo={accountsInfo[account.address]}
                                    account={account}
                                />
                            ))}
                        </CardList>
                    </>
                );
            })}
        </div>
    );
}
