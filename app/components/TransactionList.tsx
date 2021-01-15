import React from 'react';
import { useSelector } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { TransferTransaction } from '../utils/types';
import { transactionsSelector } from '../features/TransactionSlice';
import styles from './Transaction.css';

interface Props {
    chooseElement: (transaction: TransferTransaction) => void;
}

function TransactionList({ chooseElement }: Props): JSX.Element {
    const transactions = useSelector(transactionsSelector);

    return (
        <div className={styles.TransactionList}>
            {transactions.map((transaction: TransferTransaction) => (
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
