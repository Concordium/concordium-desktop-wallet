import React from 'react';
import { useSelector } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { Transaction } from '../utils/types';
import { transactionsSelector } from '../features/TransactionSlice';

interface Props {
    chooseElement: (transaction: Transaction) => void;
}

function TransactionList({ chooseElement }: Props) {
    const transactions = useSelector(transactionsSelector);

    return (
        <>
            {transactions.map((transaction: Transaction) => (
                <TransactionListElement
                    transaction={transaction}
                    key={transaction.transactionHash}
                    onClick={() => chooseElement(transaction)}
                />
            ))}
        </>
    );
}

export default TransactionList;
