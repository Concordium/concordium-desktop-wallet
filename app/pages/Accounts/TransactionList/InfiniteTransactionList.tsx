import React, {
    createContext,
    forwardRef,
    Fragment,
    useContext,
    useState,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { VariableSizeList as List } from 'react-window';

import { PropsOf, TransferTransaction } from '~/utils/types';
import TransactionListHeader, {
    transactionListHeaderHeight,
} from './TransactionListHeader';
import TransactionListElement, {
    transactionListElementHeight,
} from './TransactionListElement';

import styles from './TransactionList.module.scss';
import useTransactionGroups, {
    TransactionsByDateTuple,
} from './useTransactionGroups';

const PAGE_SIZE = 100;

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

interface Props {
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
}

export default function InfiniteTransactionList({
    transactions,
    onTransactionClick,
}: Props) {
    const [page, setPage] = useState(1);
    const pagedTransactions = transactions.slice(0, page * PAGE_SIZE);
    const groups = useTransactionGroups(pagedTransactions);
    const headersAndTransactions = groups.flat(2);

    return (
        <StickyContext.Provider value={{ groups }}>
            <AutoSizer>
                {({ height, width }) => (
                    <InfiniteLoader
                        isItemLoaded={(i) => i < pagedTransactions.length}
                        itemCount={transactions.length}
                        loadMoreItems={() => setPage((p) => p + 1)}
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
