import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Identity, Account, AccountInfo } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import {
    accountsOfIdentitySelector,
    accountsSelector,
    accountsInfoSelector,
    loadAccountInfos,
} from '~/features/AccountSlice';
import CardList from '~/cross-app-components/CardList';

interface Props {
    chosenAccount?: Account;
    identity?: Identity;
    setAccount: (account: Account) => void;
    filter?: (account: Account, info?: AccountInfo) => boolean;
}

/**
 * Allows the user to pick an account of the given identity.
 */
export default function PickAccount({
    chosenAccount,
    setAccount,
    identity,
    filter,
}: Props): JSX.Element {
    const dispatch = useDispatch();

    const selectAccounts = useMemo(
        () =>
            identity ? accountsOfIdentitySelector(identity) : accountsSelector,
        [identity]
    );
    const accounts = useSelector(selectAccounts);
    const accountsInfo = useSelector(accountsInfoSelector);
    const [chosenIndex, setChosenIndex] = useState<number | undefined>();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (chosenAccount) {
            setChosenIndex(
                accounts.findIndex(
                    (acc) => acc.address === chosenAccount.address
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (accounts && !loaded) {
            setLoaded(true);
            loadAccountInfos(accounts, dispatch);
        }
    }, [accounts, dispatch, loaded]);

    return (
        <CardList>
            {accounts
                .filter((a) => filter?.(a, accountsInfo[a.address]) ?? true)
                .map((account: Account, index: number) => (
                    <AccountCard
                        key={account.address}
                        active={index === chosenIndex}
                        account={account}
                        accountInfo={accountsInfo[account.address]}
                        onClick={() => {
                            setChosenIndex(index);
                            setAccount(account);
                        }}
                    />
                ))}
        </CardList>
    );
}
