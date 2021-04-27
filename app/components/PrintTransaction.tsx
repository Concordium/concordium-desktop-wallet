import React from 'react';
import { Transaction, instanceOfAccountTransaction } from '~/utils/types';
import PrintAccountTransactionProposal from './PrintAccountTransactionProposal';

interface Props {
    transaction: Transaction;
}

export default function PrintTransaction({ transaction }: Props) {
    if (instanceOfAccountTransaction(transaction)) {
        return <PrintAccountTransactionProposal transaction={transaction} />;
    }

    return null;
}
