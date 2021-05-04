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

    if (transactions.length === 0) {
        return (
            <h3 className="flex justifyCenter">
                This balance has no transactions yet.
            </h3>
        );
    }

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
