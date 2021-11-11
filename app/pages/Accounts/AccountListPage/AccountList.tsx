import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    accountsSelector,
    chooseAccount,
    accountsInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import { setViewingShieldedExternal } from '~/features/TransactionSlice';
import AccountCard from '~/components/AccountCard';
import CardList from '~/cross-app-components/CardList';
import { Account, AccountStatus } from '~/utils/types';

const canSelectAccount = ({ status, isInitial }: Account) =>
    status !== AccountStatus.Pending &&
    (status !== AccountStatus.Rejected || isInitial);

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
                    onClick={
                        canSelectAccount(a)
                            ? (shielded) => {
                                  dispatch(chooseAccount(a.address));
                                  setViewingShieldedExternal(
                                      dispatch,
                                      shielded
                                  );
                              }
                            : undefined
                    }
                />
            ))}
        </CardList>
    );
}
