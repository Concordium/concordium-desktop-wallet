import groupBy from 'lodash.groupby';
import { useMemo } from 'react';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import { TimeStampUnit, TransferTransaction } from '~/utils/types';

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

export type TransactionsByDateTuple = [string, TransferTransaction[]];

export default function useTransactionGroups(
    transactions: TransferTransaction[]
): TransactionsByDateTuple[] {
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

    return transactionGroups;
}
