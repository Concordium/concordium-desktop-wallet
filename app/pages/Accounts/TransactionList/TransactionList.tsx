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
    const List = infinite ? InfiniteTransactionList : FiniteTransactionList;
    return <List {...props} />;
}

export default TransactionList;
