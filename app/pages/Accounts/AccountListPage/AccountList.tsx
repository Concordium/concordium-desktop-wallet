import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
    accountsSelector,
    chooseAccount,
    accountsInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import { setViewingShielded } from '~/features/TransactionSlice';
import AccountCard from '~/components/AccountCard';
import routes from '~/constants/routes.json';
import CardList from '~/cross-app-components/CardList';

/**
 * Displays the List of local accounts, And allows picking the chosen account.
 */
export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const chosenAccount = useSelector(chosenAccountSelector);

    if (!accounts || !accountsInfo) {
        return null;
    }

    return (
        <CardList>
            {accounts.map((a) => (
                <AccountCard
                    key={a.address}
                    active={a.address === chosenAccount?.address}
                    account={a}
                    accountInfo={accountsInfo[a.address]}
                    onClick={(shielded) => {
                        dispatch(push(routes.ACCOUNTS));
                        dispatch(chooseAccount(a.address));
                        dispatch(setViewingShielded(shielded));
                    }}
                />
            ))}
        </CardList>
    );
}
