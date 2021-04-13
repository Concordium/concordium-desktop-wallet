import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Identity, Account } from '~/utils/types';
import AccountListElement from '~/components/AccountListElement';
import {
    accountsSelector,
    accountsOfIdentitySelector,
    accountsInfoSelector,
    loadAccountInfos,
} from '~/features/AccountSlice';
import styles from './UpdateAccountCredentials.module.scss';

interface Props {
    identity?: Identity;
    onClick: (account: Account) => void;
    filter?: (account: Account) => boolean;
}

/**
 * Allows the user to pick an account of the given identity.
 */
export default function PickAccount({
    onClick,
    identity,
    filter = () => true,
}: Props): JSX.Element {
    const dispatch = useDispatch();

    let selector;
    if (identity) {
        selector = accountsOfIdentitySelector(identity);
    } else {
        selector = accountsSelector;
    }
    const accounts = useSelector(selector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const [chosenIndex, setChosenIndex] = useState(-1);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (accounts && !loaded) {
            setLoaded(true);
            loadAccountInfos(accounts, dispatch);
        }
    }, [accounts, dispatch, loaded]);

    return (
        <>
            {accounts.filter(filter).map((account: Account, index: number) => (
                <AccountListElement
                    key={account.address}
                    className={styles.listElement}
                    active={index === chosenIndex}
                    account={account}
                    accountInfo={accountsInfo[account.address]}
                    onClick={() => {
                        setChosenIndex(index);
                        onClick(account);
                    }}
                />
            ))}
        </>
    );
}
