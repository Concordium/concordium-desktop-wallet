import React, { PropsWithChildren } from 'react';
import { Style } from '~/utils/types';

import styles from './TransactionList.module.scss';

export const transactionListHeaderHeight = 13;

type Props = Style & PropsWithChildren<unknown>;

export default function TransactionListHeader({
    children,
    style = { height: transactionListHeaderHeight },
}: Props) {
    return (
        <header className={styles.transactionGroupHeader} style={style}>
            {children}
        </header>
    );
}
