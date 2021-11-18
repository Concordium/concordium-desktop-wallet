import React, {
    createContext,
    forwardRef,
    Fragment,
    useCallback,
    useContext,
    useState,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { VariableSizeList as List } from 'react-window';

import { useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { PropsOf, TransferTransaction } from '~/utils/types';
import useTransactionGroups, {
    TransactionsByDateTuple,
} from './useTransactionGroups';
import {
    hasMoreTransactionsSelector,
    loadingTransactionsSelector,
    loadTransactions,
    transactionLogPageSize,
} from '~/features/TransactionSlice';
import TransactionListHeader, {
    transactionListHeaderHeight,
} from './TransactionListHeader';
import TransactionListElement, {
    transactionListElementHeight,
} from './TransactionListElement';
import { TransactionListProps } from './util';
import useThunkDispatch from '~/store/useThunkDispatch';

import styles from './TransactionList.module.scss';
import SimpleErrorModal from '~/components/SimpleErrorModal';

type HeaderOrTransaction = string | TransferTransaction;

const isHeader = (item: HeaderOrTransaction): item is string =>
    typeof item === 'string';

const getHeight = (item: HeaderOrTransaction) =>
    isHeader(item) ? transactionListHeaderHeight : transactionListElementHeight;

const getKey = (item: HeaderOrTransaction) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    isHeader(item) ? item : item.transactionHash || item.id!;

interface StickyContextModel {
    groups: TransactionsByDateTuple[];
}
const StickyContext = createContext<StickyContextModel>({ groups: [] });

// eslint-disable-next-line react/display-name
const ListElement = forwardRef<HTMLDivElement, PropsOf<'div'>>(
    ({ children, ...rest }, ref) => {
        const { groups } = useContext(StickyContext);

        return (
            <div ref={ref} {...rest}>
                {groups.map(([header, transactions]) => (
                    <Fragment key={header}>
                        <TransactionListHeader>{header}</TransactionListHeader>
                        <div
                            style={{
                                width: '100%',
                                paddingBottom:
                                    transactions.length *
                                    transactionListElementHeight,
                            }}
                        />
                    </Fragment>
                ))}
                {children}
            </div>
        );
    }
);

export default function InfiniteTransactionList({
    transactions,
    onTransactionClick,
    abortRef,
}: TransactionListProps) {
    const dispatch = useThunkDispatch();
    const loading = useSelector(loadingTransactionsSelector);
    const hasMore = useSelector(hasMoreTransactionsSelector);
    const [error, setError] = useState<string | undefined>();

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || error) {
            return;
        }
        const load = dispatch(
            loadTransactions({
                showLoading: true,
                append: true,
                force: true,
            })
        );
        load.then(unwrapResult).catch((e) => {
            setError(e.message);
        });

        if (abortRef !== undefined) {
            abortRef.current = load.abort;
        }
    }, [dispatch, loading, hasMore, abortRef, error]);

    const groups = useTransactionGroups(transactions);
    const headersAndTransactions = groups.flat(2);

    const itemCount = hasMore
        ? headersAndTransactions.length + transactionLogPageSize
        : headersAndTransactions.length;

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to load transactions"
                content={error}
                onClick={() => setError(undefined)}
            />
            <StickyContext.Provider value={{ groups }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <InfiniteLoader
                            isItemLoaded={(i) =>
                                i < headersAndTransactions.length
                            }
                            itemCount={itemCount}
                            loadMoreItems={loadMore}
                        >
                            {({ onItemsRendered, ref }) => (
                                <List
                                    onItemsRendered={onItemsRendered}
                                    ref={ref}
                                    className={styles.infinite}
                                    width={width}
                                    height={height}
                                    itemCount={headersAndTransactions.length}
                                    itemSize={(i) =>
                                        getHeight(headersAndTransactions[i])
                                    }
                                    itemKey={(i) =>
                                        getKey(headersAndTransactions[i])
                                    }
                                    innerElementType={ListElement}
                                >
                                    {({ style, index }) => {
                                        const item =
                                            headersAndTransactions[index];

                                        if (isHeader(item)) {
                                            return (
                                                <span
                                                    className={
                                                        styles.transactionGroupHeaderPlaceholder
                                                    }
                                                    style={style}
                                                />
                                            ); // Handled in "innerElementType"
                                        }

                                        return (
                                            <TransactionListElement
                                                style={style}
                                                onClick={() =>
                                                    onTransactionClick(item)
                                                }
                                                transaction={item}
                                            />
                                        );
                                    }}
                                </List>
                            )}
                        </InfiniteLoader>
                    )}
                </AutoSizer>
            </StickyContext.Provider>
        </>
    );
}
