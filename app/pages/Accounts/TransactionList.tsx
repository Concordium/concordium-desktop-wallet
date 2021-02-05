import React from 'react';
import { useSelector } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import TransactionListElement from './TransactionListElement';
import { TransferTransaction } from '../../utils/types';
import { transactionsSelector } from '../../features/TransactionSlice';

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
        <Menu vertical fluid>
            {transactions.map((transaction: TransferTransaction) => (
                <Menu.Item
                    onClick={() => onTransactionClick(transaction)}
                    key={transaction.transactionHash}
                >
                    <TransactionListElement transaction={transaction} />
                </Menu.Item>
            ))}
        </Menu>
    );
}

export default TransactionList;
