import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    loadAccounts,
    accountsSelector,
    chooseAccount,
    chosenAccountIndexSelector,
} from '../features/AccountSlice';
import styles from './Accounts.css';
import AccountListElement from './AccountListElement';
import routes from '../constants/routes.json';

export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);

    useEffect(() => {
        if (!accounts) {
            loadAccounts(dispatch);
        }
    }, [dispatch, accounts]);

    if (!accounts) {
        return null;
    }

    return (
        <div className={styles.halfPage}>
            <Link to={routes.ACCOUNTCREATION}>
                <button type="button">+</button>
            </Link>
            <div className={styles.accountList}>
                {accounts.map((account, index) => (
                    <AccountListElement
                        key={account.address}
                        account={account}
                        onClick={() => dispatch(chooseAccount(index))}
                        highlighted={index === chosenIndex}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}
