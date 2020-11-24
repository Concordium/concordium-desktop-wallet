import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    chooseAccount,
    accounts,
    chosenAccount,
} from '../features/accounts/accountsSlice.ts';
import styles from './Accounts.css';

export default function AccountsPage() {
    const dispatch = useDispatch();
    const accountList = useSelector(accounts);
    const chosenIndex = useSelector(chosenAccount);

    return (
        <div>
            <div className={styles.accountList}>
                {accountList.map((account, i) => (
                    <div
                        onClick={() => dispatch(chooseAccount(i))}
                        key={i}
                        className={
                            i == chosenIndex ? styles.chosen : styles.nonChosen
                        }
                    >
                        {account}
                    </div>
                ))}
            </div>
            <div className={styles.chosenAccount}>
                {' '}
                {accountList[chosenIndex]}{' '}
            </div>
        </div>
    );
}
