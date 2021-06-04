import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TransactionListElement from './TransactionListElement';
import { TransferTransaction } from '~/utils/types';
import {
    moreTransactionsSelector,
    loadingTransactionsSelector,
} from '~/features/TransactionSlice';
import LoadingComponent from '~/cross-app-components/Loading';

interface Props {
    transactions: TransferTransaction[];
    onTransactionClick: (transaction: TransferTransaction) => void;
}

/**
 * Displays a list of transactions, and executes the provided onTransactionClick
 * function when a specific transaction is clicked.
 */
function TransactionList({
    onTransactionClick,
    transactions,
}: Props): JSX.Element | null {
    const more = useSelector(moreTransactionsSelector);
    const loading = useSelector(loadingTransactionsSelector);
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (loading) {
            const timerId = setTimeout(() => setShowLoading(true), 500);
            return () => clearInterval(timerId);
        }
        setShowLoading(false);
        return () => {};
    }, [loading]);

    if (showLoading) {
        return (
            <div className="flex">
                <LoadingComponent
                    inline
                    className="marginCenter mV40"
                    text="loading transactions"
                />
            </div>
        );
    }

    if (loading) {
        return null;
    }

    if (transactions.length === 0) {
        return (
            <h3 className="flex justifyCenter pB20">
                This balance has no transactions yet.
            </h3>
        );
    }

    return (
        <>
            {transactions.map((transaction: TransferTransaction) => (
                <TransactionListElement
                    onClick={() => onTransactionClick(transaction)}
                    key={transaction.transactionHash || transaction.id}
                    transaction={transaction}
                />
            ))}
            {more && (
                <h3 className="flex justifyCenter mT10 pB10">
                    Export to see older transactions
                </h3>
            )}
        </>
    );
}

export default TransactionList;
