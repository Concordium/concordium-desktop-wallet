import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    accountsInfoSelector,
    loadAccountInfos,
} from '~/features/AccountSlice';
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

    useEffect(() => {
        if (recoveredAccounts.length) {
            loadAccountInfos(
                recoveredAccounts[recoveredAccounts.length - 1],
                dispatch
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recoveredAccounts.length]);

    return (
        <div className={styles.recoveredDiv}>
            {recoveredAccounts.map((accounts, index) => (
                <>
                    <p className="bodyEmphasized textLeft">Index {index}:</p>
                    <p className="textLeft">
                        Done: Found {accounts.length} account
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
            ))}
            {status && (
                <>
                    <p className="bodyEmphasized textLeft">
                        Index {recoveredAccounts.length}:
                    </p>
                    <p className="textLeft">{status}</p>
                </>
            )}
        </div>
    );
}
