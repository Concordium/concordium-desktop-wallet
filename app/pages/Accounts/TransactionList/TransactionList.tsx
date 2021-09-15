import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import groupBy from 'lodash.groupby';
import clsx from 'clsx';
import { TimeStampUnit, TransferTransaction } from '~/utils/types';
import { loadingTransactionsSelector } from '~/features/TransactionSlice';
import LoadingComponent from '~/cross-app-components/Loading';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import TransactionListHeader from './TransactionListHeader';
import TransactionListElement from './TransactionListElement';
import InfiniteTransactionList from './InfiniteTransactionList';

import styles from './TransactionList.module.scss';

const dateFormat = Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
    .format;

const getGroupHeader = (d: Date): string => {
    const today = new Date().toDateString();
    const yesterday = new Date(
        new Date().setDate(new Date().getDate() - 1)
    ).toDateString();

    switch (d.toDateString()) {
        case today:
            return 'Today';
        case yesterday:
            return 'Yesterday';
        default:
            return dateFormat(d);
    }
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getKey = (t: TransferTransaction) => t.transactionHash || t.id!;

interface Props {
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
    infinite?: boolean;
}

/**
 * Displays a list of transactions, and executes the provided onTransactionClick
 * function when a specific transaction is clicked.
 */
function TransactionList({
    transactions,
    onTransactionClick,
    infinite = false,
}: Props): JSX.Element | null {
    const loading = useSelector(loadingTransactionsSelector);
    const [showLoading, setShowLoading] = useState(false);

    const transactionGroups = useMemo(
        () =>
            Object.entries(
                groupBy(transactions, (t) =>
                    getGroupHeader(
                        dateFromTimeStamp(t.blockTime, TimeStampUnit.seconds)
                    )
                )
            ),
        [transactions]
    );

    useEffect(() => {
        if (loading) {
            const timerId = setTimeout(() => setShowLoading(true), 500);
            return () => clearInterval(timerId);
        }
        setShowLoading(false);
        return () => {};
    }, [loading]);

    if (showLoading) {
        return (
            <div className="flex">
                <LoadingComponent
                    inline
                    className="marginCenter mV40"
                    text="loading transactions"
                />
            </div>
        );
    }

    if (loading) {
        return null;
    }

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

    if (infinite) {
        return (
            <InfiniteTransactionList
                transactionGroups={transactionGroups}
                onTransactionClick={onTransactionClick}
            />
        );
    }

    return (
        <>
            {transactionGroups.map(([h, ts]) => (
                <Fragment key={h}>
                    <TransactionListHeader>{h}</TransactionListHeader>
                    {ts.map((t: TransferTransaction) => (
                        <TransactionListElement
                            onClick={() => onTransactionClick(t)}
                            key={getKey(t)}
                            transaction={t}
                        />
                    ))}
                </Fragment>
            ))}
        </>
    );
}

export default TransactionList;
