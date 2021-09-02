import React from 'react';
import { TransferTransaction } from '~/utils/types';
import TransactionListElement from './TransactionListElement';

import styles from '../Transactions.module.scss';

interface Props {
    header: string;
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
}

export default function TransactionListGroup({
    header,
    transactions,
    onTransactionClick,
}: Props) {
    return (
        <section>
            <header className={styles.transactionGroupHeader}>{header}</header>
            {transactions.map((transaction: TransferTransaction) => (
                <TransactionListElement
                    onClick={() => onTransactionClick(transaction)}
                    key={transaction.transactionHash || transaction.id}
                    transaction={transaction}
                />
            ))}
        </section>
    );
}
