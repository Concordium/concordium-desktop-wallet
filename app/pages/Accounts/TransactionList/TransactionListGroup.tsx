import React from 'react';
import clsx from 'clsx';
import { ClassName, TransferTransaction } from '~/utils/types';
import TransactionListElement from './TransactionListElement';

import styles from '../Transactions.module.scss';

interface Props extends ClassName {
    header: string;
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
}

export default function TransactionListGroup({
    header,
    transactions,
    onTransactionClick,
    className,
}: Props) {
    return (
        <section className={clsx(className)}>
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
