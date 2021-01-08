import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { Transaction } from '../utils/types';
import { getHighestId } from '../utils/transactionHelpers';
import {
    transactionsSelector,
    updateTransactions,
    loadTransactions,
} from '../features/TransactionSlice';
import styles from './Transaction.css';

interface Props {
    account: Account;
    chooseElement: (transaction: Transaction) => void;
    viewingShielded: boolean;
}

function TransactionList({ account, chooseElement, viewingShielded }: Props) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);

    useEffect(() => {
        loadTransactions(account, viewingShielded, dispatch);
    }, [account, viewingShielded, dispatch]);

    return (
        <div className={styles.transactionBox}>
            <button
                type="button"
                onClick={() =>
                    updateTransactions(
                        account,
                        getHighestId(transactions)
                    ).then(() =>
                        loadTransactions(account, viewingShielded, dispatch)
                    )
                }
            >
                Update
            </button>
            {transactions.map((transaction: Transaction) => (
                <TransactionListElement
                    transaction={transaction}
                    key={transaction.transactionHash}
                    onClick={() => chooseElement(transaction)}
                />
            ))}
        </div>
    );
}

export default TransactionList;
