import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
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
