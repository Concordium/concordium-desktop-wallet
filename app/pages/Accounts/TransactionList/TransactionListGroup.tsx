/* eslint-disable react/destructuring-assignment */
import React from 'react';
import clsx from 'clsx';
import { FixedSizeList as List } from 'react-window';
import { ClassName, TransferTransaction } from '~/utils/types';
import TransactionListElement, {
    transactionListElementHeight,
} from './TransactionListElement';

import styles from './TransactionList.module.scss';

const headerHeight = 13;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getKey = (t: TransferTransaction) => t.transactionHash || t.id!;

interface BaseProps extends ClassName {
    header: string;
    transactions: TransferTransaction[];
    onTransactionClick(transaction: TransferTransaction): void;
}

interface LimitedProps extends BaseProps {
    infinite?: false;
}

interface InfinitProps extends BaseProps {
    infinite: true;
    height: number;
}

type Props = LimitedProps | InfinitProps;

export default function TransactionListGroup(props: Props) {
    const { header, transactions, onTransactionClick, className } = props;
    return (
        <section className={clsx(className)}>
            <header
                className={styles.transactionGroupHeader}
                style={{ height: headerHeight }}
            >
                {header}
            </header>
            {props.infinite ? (
                <List
                    itemCount={transactions.length}
                    itemSize={transactionListElementHeight}
                    width="100%"
                    height={props.height - headerHeight}
                    itemKey={(i) => getKey(transactions[i])}
                >
                    {({ style, index }) => {
                        const t = transactions[index];
                        return (
                            <TransactionListElement
                                style={style}
                                onClick={() => onTransactionClick(t)}
                                transaction={t}
                            />
                        );
                    }}
                </List>
            ) : (
                transactions.map((t: TransferTransaction) => (
                    <TransactionListElement
                        style={{ height: transactionListElementHeight }}
                        onClick={() => onTransactionClick(t)}
                        key={getKey(t)}
                        transaction={t}
                    />
                ))
            )}
        </section>
    );
}
