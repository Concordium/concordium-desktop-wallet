import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { getHighestId } from '../utils/transactionHelpers';
import {
    transactionsSelector,
    updateTransactions,
    loadTransactions,
} from '../features/TransactionSlice';
import styles from './Transaction.css';

interface Props {
    account: Account;
    chooseElement: () => void;
}

function TransactionList({ account, chooseElement }: Props) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);

    useEffect(() => {
        loadTransactions(account, dispatch);
    }, [account, dispatch]);

    return (
        <div className={styles.transactionBox}>
            <button
                type="button"
                onClick={() =>
                    updateTransactions(
                        account,
                        getHighestId(transactions)
                    ).then(() => loadTransactions(account, dispatch))
                }
            >
                Update
            </button>
            {transactions.map((transaction) => (
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
