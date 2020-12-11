import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    accountsSelector,
    chooseAccount,
    chosenAccountIndexSelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';
import accountListElement from './AccountListElement';
import routes from '../constants/routes.json';

export default function AccountList() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const chosenIndex = useSelector(chosenAccountIndexSelector);

    return (
        <div className={styles.halfPage}>
            <Link to={routes.ACCOUNTCREATION}>
                <button>+</button>
            </Link>
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
