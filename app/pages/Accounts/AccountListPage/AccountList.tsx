import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    accountsSelector,
    chooseAccount,
    accountsInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import { setViewingShieldedAndReset } from '~/features/TransactionSlice';
import AccountCard from '~/components/AccountCard';
import CardList from '~/cross-app-components/CardList';
import { AccountStatus } from '~/utils/types';

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
                        a.status !== AccountStatus.Pending
                            ? (shielded) => {
                                  dispatch(chooseAccount(a.address));
                                  setViewingShieldedAndReset(
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
