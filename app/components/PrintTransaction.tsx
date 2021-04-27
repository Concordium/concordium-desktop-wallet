import React from 'react';
import { Transaction, instanceOfAccountTransaction } from '~/utils/types';
import PrintAccountTransaction from './PrintAccountTransaction';

interface Props {
    transaction: Transaction;
}

export default function PrintTransaction({ transaction }: Props) {
    if (instanceOfAccountTransaction(transaction)) {
        return <PrintAccountTransaction transaction={transaction} />;
    }

    return null;
}
