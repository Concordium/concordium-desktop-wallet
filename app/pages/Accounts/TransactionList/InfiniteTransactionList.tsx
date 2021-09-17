import React, {
    createContext,
    forwardRef,
    Fragment,
    useCallback,
    useContext,
    useEffect,
    useMemo,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { VariableSizeList as List } from 'react-window';

import { useDispatch, useSelector } from 'react-redux';
import { PropsOf, TransferTransaction } from '~/utils/types';
import useTransactionGroups, {
    TransactionsByDateTuple,
} from './useTransactionGroups';
import {
    loadingTransactionsSelector,
    loadTransactions,
    transactionLogPageSize,
} from '~/features/TransactionSlice';
import { chosenAccountSelector } from '~/features/AccountSlice';
import AbortController from '~/utils/AbortController';
import TransactionListHeader, {
    transactionListHeaderHeight,
} from './TransactionListHeader';
import TransactionListElement, {
    transactionListElementHeight,
} from './TransactionListElement';

import styles from './TransactionList.module.scss';
import { TransactionListProps } from './util';

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
}: TransactionListProps) {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const loading = useSelector(loadingTransactionsSelector);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadController = useMemo(() => new AbortController(), [
        account?.address,
    ]);
    useEffect(() => () => loadController.abort(), [loadController]);

    const loadMore = useCallback(async () => {
        if (loading) {
            return;
        }

        await dispatch(
            loadTransactions({
                controller: loadController,
                showLoading: true,
                append: true,
            })
        );
    }, [dispatch, loadController, loading]);

    const groups = useTransactionGroups(transactions);
    const headersAndTransactions = groups.flat(2);

    const itemCount = headersAndTransactions.length + transactionLogPageSize;

    return (
        <StickyContext.Provider value={{ groups }}>
            <AutoSizer>
                {({ height, width }) => (
                    <InfiniteLoader
                        isItemLoaded={(i) => i < headersAndTransactions.length}
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
                                    const item = headersAndTransactions[index];

                                    if (isHeader(item)) {
                                        return null; // Handled in "innerElementType"
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
    );
}
