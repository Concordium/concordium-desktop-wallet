import clsx from 'clsx';
import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import TabbedCard from '~/components/TabbedCard';
import { TabbedCardTabRef } from '~/components/TabbedCard/TabbedCardTab';
import {
    transactionLogPageSize,
    transactionsSelector,
} from '~/features/TransactionSlice';
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
    const infinite = useMemo(
        () => transactions.length >= transactionLogPageSize,
        [transactions.length]
    );
    const [showingLog, setShowingLog] = useState(true);

    const transactionsTabRef = useRef<TabbedCardTabRef>(null);

    return (
        <TabbedCard className={styles.root}>
            <TabbedCard.Tab
                header="Transactions"
                ref={transactionsTabRef}
                onClick={() => setShowingLog(true)}
            >
                {chosenTransaction ? (
                    <TransactionView
                        transaction={chosenTransaction}
                        onClose={() => setChosenTransaction(undefined)}
                    />
                ) : (
                    <div
                        className={clsx(
                            styles.scroll,
                            infinite && showingLog && styles.scrollInfinite
                        )}
                    >
                        <TransactionList
                            infinite={infinite}
                            transactions={transactions}
                            onTransactionClick={setChosenTransaction}
                        />
                    </div>
                )}
            </TabbedCard.Tab>
            <TabbedCard.Tab
                header="Filters"
                onClick={() => {
                    setChosenTransaction(undefined);
                    setShowingLog(false);
                }}
            >
                <div className={styles.scroll}>
                    <div className={styles.bar} />
                    <TransactionLogFilters
                        onUpdate={() => {
                            transactionsTabRef.current?.focus();
                            setShowingLog(true);
                        }}
                    />
                </div>
            </TabbedCard.Tab>
        </TabbedCard>
    );
}
