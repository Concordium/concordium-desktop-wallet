import React from 'react';
import { useSelector } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { TransferTransaction } from '~/utils/types';
import { transactionsSelector } from '~/features/TransactionSlice';

interface Props {
    onTransactionClick: (transaction: TransferTransaction) => void;
}

/**
 * Displays the currently chosen transactions
 * Takes a function chooseElement, to allows the parent
 * to get notified of clicked transactions.
 */
function TransactionList({ onTransactionClick }: Props): JSX.Element {
    const transactions = useSelector(transactionsSelector);

    return (
        <>
            {transactions.map((transaction: TransferTransaction) => (
                <TransactionListElement
                    onClick={() => onTransactionClick(transaction)}
                    key={transaction.transactionHash}
                    transaction={transaction}
                />
            ))}
        </>
    );
}

export default TransactionList;
