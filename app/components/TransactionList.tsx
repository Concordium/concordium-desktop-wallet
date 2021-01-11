import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { Transaction } from '../utils/types';
import { getHighestId } from '../utils/transactionHelpers';
import {
    transactionsSelector,
    updateTransactions,
    loadTransactions,
    viewingShieldedSelector,
} from '../features/TransactionSlice';
import styles from './Transaction.css';

interface Props {
    account: Account;
    chooseElement: (transaction: Transaction) => void;
}

function TransactionList({ account, chooseElement }: Props) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

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
