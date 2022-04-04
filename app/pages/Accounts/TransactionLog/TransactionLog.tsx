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
import TransactionList from '../TransactionList';
import TransactionView from '../TransactionView';
import TransactionLogFilters from '../TransactionLogFilters';
import TransactionsHeader from '../TransactionsHeader';

import styles from './TransactionLog.module.scss';

interface Props {
    abortRef: React.MutableRefObject<
        ((reason?: string | undefined) => void) | undefined
    >;
    /**
     * Only show latest N transactions. Setting this disables inifinite scrolling.
     */
    limitLatest?: number;
}

export default function TransactionLog({ abortRef, limitLatest }: Props) {
    const transactions = useSelector(transactionsSelector);
    const hasMoreTransactions = useSelector(hasMoreTransactionsSelector);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >();
    const infinite = useMemo(
        () =>
            limitLatest === undefined &&
            (transactions.length >= transactionLogPageSize ||
                hasMoreTransactions),
        [transactions.length, hasMoreTransactions, limitLatest]
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
                            transactions={
                                limitLatest
                                    ? transactions.slice(0, limitLatest)
                                    : transactions
                            }
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
