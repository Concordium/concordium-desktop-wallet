import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { List, Button } from 'semantic-ui-react';
import {
    loadAccounts,
    accountsSelector,
    chooseAccount,
    chosenAccountIndexSelector,
    accountsInfoSelector,
} from '../features/AccountSlice';
import { setViewingShielded } from '../features/TransactionSlice';
import styles from './Accounts.css';
import AccountListElement from './AccountListElement';
import routes from '../constants/routes.json';
import { Account } from '../utils/types';

export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);

    useEffect(() => {
        loadAccounts(dispatch);
    }, [dispatch]);

    if (!accounts || !accountsInfo) {
        return null;
    }

    return (
        <>
            <Button onClick={() => push(routes.ACCOUNTCREATION)}>+</Button>
            <List divided>
                {accounts.map((account: Account, index: number) => (
                    <List.Item
                        key={account.address}
                        className={`${styles.accountListElement} ${
                            index === chosenIndex
                                ? styles.chosenAccountListElement
                                : null
                        }`}
                    >
                        <AccountListElement
                            account={account}
                            accountInfo={accountsInfo[account.address]}
                            onClick={(shielded) => {
                                dispatch(chooseAccount(index));
                                dispatch(setViewingShielded(shielded));
                            }}
                        />
                    </List.Item>
                ))}
            </List>
        </>
    );
}
