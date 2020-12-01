import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    chooseAccount,
    chosenAccountSelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';

export default function AccountListElement(account, index) {
    const dispatch = useDispatch();
    const chosenIndex = useSelector(chosenAccountSelector);

    return (
        <div
            onClick={() => dispatch(chooseAccount(index))}
            key={index}
            className={`${styles.accountListElement} ${
                index === chosenIndex ? styles.chosenAccountListElement : null
            }`}
        >
            {account.name}
        </div>
    );
}
