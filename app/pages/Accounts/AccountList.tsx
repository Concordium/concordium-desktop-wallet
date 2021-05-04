import React, { useEffect, useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadAccounts,
    loadAccountInfos,
    accountsSelector,
    chooseAccount,
    chosenAccountIndexSelector,
    accountsInfoSelector,
} from '../../features/AccountSlice';
import { setViewingShielded } from '../../features/TransactionSlice';
import AccountListElement from '../../components/AccountListElement';
import { Account, Dispatch } from '../../utils/types';
import routes from '../../constants/routes.json';
import styles from './Accounts.module.scss';
import SimpleErrorModal from '~/components/SimpleErrorModal';

async function load(dispatch: Dispatch) {
    const accounts = await loadAccounts(dispatch);
    return loadAccountInfos(accounts, dispatch);
}

/**
 * Displays the List of local accounts, And allows picking the chosen account.
 * TODO: move the "AccountCreation start button"?
 */
export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);
    const [error, setError] = useState<string>();

    useEffect(() => {
        load(dispatch).catch((e) => setError(e.toString()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    if (!accounts || !accountsInfo) {
        return null;
    }

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to load Accounts"
                content={error}
                onClick={() => dispatch(push(routes.HOME))}
            />
            {accounts.map((account: Account, index: number) => (
                <AccountListElement
                    key={account.address}
                    className={styles.listElement}
                    active={index === chosenIndex}
                    account={account}
                    accountInfo={accountsInfo[account.address]}
                    onClick={(shielded) => {
                        dispatch(push(routes.ACCOUNTS));
                        dispatch(chooseAccount(index));
                        dispatch(setViewingShielded(shielded));
                    }}
                />
            ))}
        </>
    );
}
