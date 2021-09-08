import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import TabbedCard from '~/components/TabbedCard';
import { TabbedCardTabRef } from '~/components/TabbedCard/TabbedCardTab';
import { transactionsSelector } from '~/features/TransactionSlice';
import { TransferTransaction } from '~/utils/types';
import TransactionList from '../../TransactionList';
import TransactionView from '../../TransactionView';
import TransactionLogFilters from '../TransactionLogFilters/TransactionLogFilters';

import styles from './TransactionLog.module.scss';

export default function TransactionLog() {
    const transactions = useSelector(transactionsSelector);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >();
    const transactionsTabRef = useRef<TabbedCardTabRef>(null);

    return (
        <TabbedCard className={styles.root}>
            <TabbedCard.Tab header="Transactions" ref={transactionsTabRef}>
                {chosenTransaction ? (
                    <TransactionView
                        transaction={chosenTransaction}
                        onClose={() => setChosenTransaction(undefined)}
                    />
                ) : (
                    <div className={styles.scroll}>
                        <TransactionList
                            transactions={transactions}
                            onTransactionClick={setChosenTransaction}
                        />
                    </div>
                )}
            </TabbedCard.Tab>
            <TabbedCard.Tab
                header="Filters"
                onClick={() => setChosenTransaction(undefined)}
            >
                <div className={styles.scroll}>
                    <div className={styles.bar} />
                    <TransactionLogFilters
                        onUpdate={() => {
                            transactionsTabRef.current?.focus();
                        }}
                    />
                </div>
            </TabbedCard.Tab>
        </TabbedCard>
    );
}
