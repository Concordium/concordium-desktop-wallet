import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Identity, Account } from '~/utils/types';
import AccountListElement from '~/components/AccountListElement';
import {
    accountsOfIdentitySelector,
    accountsInfoSelector,
    loadAccountInfos,
} from '~/features/AccountSlice';
import CardList from '~/cross-app-components/CardList';

interface Props {
    identity: Identity | undefined;
    setReady: (ready: boolean) => void;
    setAccount: (account: Account) => void;
}

/**
 * Allows the user to pick an account of the given identity.
 */
export default function PickAccount({
    setReady,
    setAccount,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();

    if (!identity) {
        throw new Error('unexpected missing identity');
    }

    const accounts = useSelector(accountsOfIdentitySelector(identity));
    const accountsInfo = useSelector(accountsInfoSelector);
    const [chosenIndex, setChosenIndex] = useState<number | undefined>();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (accounts && !loaded) {
            setLoaded(true);
            loadAccountInfos(accounts, dispatch);
        }
    }, [accounts, dispatch, loaded]);

    return (
        <CardList>
            {accounts.map((account: Account, index: number) => (
                <AccountListElement
                    key={account.address}
                    active={index === chosenIndex}
                    account={account}
                    accountInfo={accountsInfo[account.address]}
                    onClick={() => {
                        setReady(true);
                        setChosenIndex(index);
                        setAccount(account);
                    }}
                />
            ))}
        </CardList>
    );
}
