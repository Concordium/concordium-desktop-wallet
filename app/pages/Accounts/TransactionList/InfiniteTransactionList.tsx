import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';

import { TransferTransaction } from '~/utils/types';
import TransactionListHeader, {
    transactionListHeaderHeight,
} from './TransactionListHeader';
import TransactionListElement, {
    transactionListElementHeight,
} from './TransactionListElement';

import styles from './TransactionList.module.scss';

type HeaderOrTransaction = string | TransferTransaction;

const isHeader = (item: HeaderOrTransaction): item is string =>
    typeof item === 'string';

const getHeight = (item: HeaderOrTransaction) =>
    isHeader(item) ? transactionListHeaderHeight : transactionListElementHeight;

const getKey = (item: HeaderOrTransaction) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    isHeader(item) ? item : item.transactionHash || item.id!;

interface Props {
    transactionGroups: [string, TransferTransaction[]][];
    onTransactionClick(transaction: TransferTransaction): void;
}

export default function InfiniteTransactionList({
    transactionGroups,
    onTransactionClick,
}: Props) {
    const headersAndTransactions = transactionGroups.flat(2);

    return (
        <AutoSizer>
            {({ height, width }) => (
                <List
                    className={styles.infinite}
                    width={width}
                    height={height}
                    itemCount={headersAndTransactions.length}
                    itemSize={(i) => getHeight(headersAndTransactions[i])}
                    itemKey={(i) => getKey(headersAndTransactions[i])}
                >
                    {({ style, index }) => {
                        const item = headersAndTransactions[index];

                        if (isHeader(item)) {
                            return (
                                <TransactionListHeader style={style}>
                                    {item}
                                </TransactionListHeader>
                            );
                        }

                        return (
                            <TransactionListElement
                                style={style}
                                onClick={() => onTransactionClick(item)}
                                transaction={item}
                            />
                        );
                    }}
                </List>
            )}
        </AutoSizer>
    );
}
