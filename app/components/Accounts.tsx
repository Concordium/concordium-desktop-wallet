import React from 'react';
import { useSelector } from 'react-redux';
import {
    accountsSelector,
    chooseAccount,
    chosenAccountSelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';
import accountListElement from './AccountListElement';

export default function AccountList() {
    const accounts = useSelector(accountsSelector);
    const chosenIndex = useSelector(chosenAccountSelector);

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
