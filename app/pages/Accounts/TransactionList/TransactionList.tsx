import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import groupBy from 'lodash.groupby';
import { TimeStampUnit, TransferTransaction } from '~/utils/types';
import {
    moreTransactionsSelector,
    loadingTransactionsSelector,
} from '~/features/TransactionSlice';
import LoadingComponent from '~/cross-app-components/Loading';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import TransactionListGroup from './TransactionListGroup';

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

interface Props {
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
}

/**
 * Displays a list of transactions, and executes the provided onTransactionClick
 * function when a specific transaction is clicked.
 */
function TransactionList({
    transactions,
    onTransactionClick,
}: Props): JSX.Element | null {
    const more = useSelector(moreTransactionsSelector);
    const loading = useSelector(loadingTransactionsSelector);
    const [showLoading, setShowLoading] = useState(false);

    const transactionGroups = useMemo(
        () =>
            groupBy(transactions, (t) =>
                getGroupHeader(
                    dateFromTimeStamp(t.blockTime, TimeStampUnit.seconds)
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
            <h3 className="flex justifyCenter pB20">
                This balance has no transactions yet.
            </h3>
        );
    }

    return (
        <>
            {Object.entries(transactionGroups).map(([h, ts]) => (
                <TransactionListGroup
                    key={h}
                    header={h}
                    transactions={ts}
                    onTransactionClick={onTransactionClick}
                />
            ))}
            {more && (
                <h3 className="flex justifyCenter mT10 pB10">
                    Export to see older transactions
                </h3>
            )}
        </>
    );
}

export default TransactionList;
