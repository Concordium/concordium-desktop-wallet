import React from 'react';
import clsx from 'clsx';
import InfiniteTransactionList from './InfiniteTransactionList';

import styles from './TransactionList.module.scss';
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
    const { transactions } = props;

    if (transactions.length === 0) {
        return (
            <h3
                className={clsx(
                    'flex justifyCenter mV0 pT20',
                    styles.thickBlueSeparatorTop,
                    styles.cardPadding
                )}
            >
                No transactions to show for account.
            </h3>
        );
    }

    const List = infinite ? InfiniteTransactionList : FiniteTransactionList;

    return <List {...props} />;
}

export default TransactionList;
