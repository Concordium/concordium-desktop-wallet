import React, { useEffect } from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadAccounts,
    loadAccountInfos,
    accountsSelector,
    chooseAccount,
    chosenAccountIndexSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import { setViewingShielded } from '~/features/TransactionSlice';
import AccountCard from '~/components/AccountCard';
import { Account, Dispatch } from '~/utils/types';
import routes from '~/constants/routes.json';
import CardList from '~/cross-app-components/CardList';

async function load(dispatch: Dispatch) {
    const accounts = await loadAccounts(dispatch);
    try {
        loadAccountInfos(accounts, dispatch);
    } catch (e) {
        throw new Error('Unable to load AccountInfo'); // TODO: Handle the case where we can't reach the node
    }
}

/**
 * Displays the List of local accounts, And allows picking the chosen account.
 */
export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);

    useEffect(() => {
        load(dispatch);
    }, [dispatch]);

    if (!accounts || !accountsInfo) {
        return null;
    }

    return (
        <CardList>
            {accounts.map((account: Account, index: number) => (
                <AccountCard
                    key={account.address}
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
        </CardList>
    );
}
