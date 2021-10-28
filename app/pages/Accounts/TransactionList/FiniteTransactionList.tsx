import clsx from 'clsx';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Loading from '~/cross-app-components/Loading';
import {
    loadingTransactionsSelector,
    viewingShieldedSelector,
} from '~/features/TransactionSlice';
import { TransferTransaction } from '~/utils/types';
import TransactionListElement from './TransactionListElement';
import TransactionListHeader from './TransactionListHeader';
import useTransactionGroups from './useTransactionGroups';
import { TransactionListProps } from './util';

import styles from './TransactionList.module.scss';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import GtuDrop from './GtuDrop';
import { chosenAccountSelector } from '~/features/AccountSlice';

const isMainnet = getTargetNet() === Net.Mainnet;

export default function FiniteTransactionList({
    transactions,
    onTransactionClick,
}: TransactionListProps) {
    const groups = useTransactionGroups(transactions);
    const loading = useSelector(loadingTransactionsSelector);
    const account = useSelector(chosenAccountSelector);
    const isViewingShielded = useSelector(viewingShieldedSelector);
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
            <div className={clsx('flex', styles.thickBlueSeparatorTop)}>
                <Loading
                    inline
                    className="marginCenter mV40"
                    text="Loading transactions"
                />
            </div>
        );
    }

    if (transactions.length === 0 && !loading) {
        // Only present a GTU drop when not on mainnet, and if no transaction filter
        // has ever been set. We expect to have an endpoint available in the wallet proxy
        // at a later point that will determine whether a GTU drop is available for the given
        // account, so this solution is expected to be temporary.
        if (
            !isMainnet &&
            !isViewingShielded &&
            account &&
            Object.keys(account.transactionFilter).length === 0
        ) {
            return <GtuDrop />;
        }
        return (
            <h3
                className={clsx(
                    'flex justifyCenter mV0 pV20',
                    styles.thickBlueSeparatorTop,
                    styles.cardPadding
                )}
            >
                No transactions to show for account.
            </h3>
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
                            key={t.transactionHash || t.id!}
                            transaction={t}
                        />
                    ))}
                </Fragment>
            ))}
        </>
    );
}
