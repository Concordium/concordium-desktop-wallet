import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TabbedCard from '~/components/TabbedCard';
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

    return (
        <TabbedCard className={styles.root}>
            <TabbedCard.Tab header="Transactions">
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
                    <TransactionLogFilters />
                </div>
            </TabbedCard.Tab>
        </TabbedCard>
    );
}
