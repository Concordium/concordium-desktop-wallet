import React from 'react';
import InfiniteTransactionList from './InfiniteTransactionList';

import FiniteTransactionList from './FiniteTransactionList';
import { TransactionListProps } from './util';

interface Props extends TransactionListProps {
    infinite?: boolean;
}

/**
 * Displays a list of transactions, and executes the provided onTransactionClick
 * function when a specific transaction is clicked.
 */
function TransactionList({
    infinite = false,
    ...props
}: Props): JSX.Element | null {
    // If the first transaction in the list changes, then (if an infinite list), the component
    // has to be reset, otherwise the infinite loader messes up the UI.
    const key = props.transactions[0]?.transactionHash
        ? props.transactions[0]?.transactionHash
        : props.transactions[0]?.id;
    const List = infinite ? (
        <InfiniteTransactionList key={key} {...props} />
    ) : (
        <FiniteTransactionList {...props} />
    );
    return List;
}

export default TransactionList;
