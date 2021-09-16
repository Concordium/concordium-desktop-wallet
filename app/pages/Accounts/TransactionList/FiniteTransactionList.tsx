import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Loading from '~/cross-app-components/Loading';
import { loadingTransactionsSelector } from '~/features/TransactionSlice';
import { TransferTransaction } from '~/utils/types';
import TransactionListElement from './TransactionListElement';
import TransactionListHeader from './TransactionListHeader';
import useTransactionGroups from './useTransactionGroups';
import { TransactionListProps } from './util';

export default function FiniteTransactionList({
    transactions,
    onTransactionClick,
}: TransactionListProps) {
    const groups = useTransactionGroups(transactions);
    const loading = useSelector(loadingTransactionsSelector);
    const [showLoading, setShowLoading] = useState(false);

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
                <Loading
                    inline
                    className="marginCenter mV40"
                    text="loading transactions"
                />
            </div>
        );
    }

    return (
        <>
            {groups.map(([h, ts]) => (
                <Fragment key={h}>
                    <TransactionListHeader>{h}</TransactionListHeader>
                    {ts.map((t: TransferTransaction) => (
                        <TransactionListElement
                            onClick={() => onTransactionClick(t)}
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            key={t.id!}
                            transaction={t}
                        />
                    ))}
                </Fragment>
            ))}
        </>
    );
}
