import clsx from 'clsx';
import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import TabbedCard from '~/components/TabbedCard';
import { TabbedCardTabRef } from '~/components/TabbedCard/TabbedCardTab';
import {
    hasMoreTransactionsSelector,
    transactionLogPageSize,
    transactionsSelector,
} from '~/features/TransactionSlice';
import { TransferTransaction } from '~/utils/types';
import TransactionList from '../../TransactionList';
import TransactionView from '../../TransactionView';
import TransactionLogFilters from '../TransactionLogFilters';

import styles from './TransactionLog.module.scss';
import TransactionsHeader from '../../TransactionsHeader';

interface Props {
    abortRef: React.MutableRefObject<
        ((reason?: string | undefined) => void) | undefined
    >;
}

export default function TransactionLog({ abortRef }: Props) {
    const transactions = useSelector(transactionsSelector);
    const hasMoreTransactions = useSelector(hasMoreTransactionsSelector);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >();
    const infinite = useMemo(
        () =>
            transactions.length >= transactionLogPageSize ||
            hasMoreTransactions,
        [transactions.length, hasMoreTransactions]
    );
    const [showingLog, setShowingLog] = useState(true);

    const transactionsTabRef = useRef<TabbedCardTabRef>(null);

    return (
        <TabbedCard className={styles.root}>
            <TabbedCard.Tab
                header={<TransactionsHeader text="Transactions" />}
                ref={transactionsTabRef}
                onClick={() => setShowingLog(true)}
            >
                {chosenTransaction ? (
                    <TransactionView
                        transaction={chosenTransaction}
                        setTransaction={setChosenTransaction}
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
                            abortRef={abortRef}
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
