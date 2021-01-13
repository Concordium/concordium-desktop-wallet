import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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

export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);

    useEffect(() => {
        loadAccounts(dispatch);
    }, [dispatch]);

    if (!accounts || !accountsInfo) {
        return <div />;
    }

    return (
        <div className={styles.halfPage}>
            <Link to={routes.ACCOUNTCREATION}>
                <button type="button">+</button>
            </Link>
            <div className={styles.accountList}>
                {accounts.map((account, index) => (
                    <AccountListElement
                        account={account}
                        accountInfo={accountsInfo[account.address]}
                        key={account.address}
                        onClick={(shielded) => {
                            dispatch(chooseAccount(index));
                            dispatch(setViewingShielded(shielded));
                        }}
                        highlighted={index === chosenIndex}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}
