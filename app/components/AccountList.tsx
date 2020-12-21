import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadAccounts,
    accountsSelector,
    chooseAccount,
    chosenAccountIndexSelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';
import accountListElement from './AccountListElement';

export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);

    useEffect(() => {
        if (!accounts) {
            loadAccounts(dispatch);
        }
    }, [dispatch, accounts]);

    console.log(accounts);

    if (!accounts) {
        return <div />;
    }

    return (
        <div className={styles.halfPage}>
            <div className={styles.accountList}>
                {accounts.map((account, index) =>
                    accountListElement(
                        account,
                        () => dispatch(chooseAccount(index)),
                        index === chosenIndex
                    )
                )}
            </div>
        </div>
    );
}
