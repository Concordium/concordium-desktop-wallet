import React from 'react';
import { Transaction, instanceOfAccountTransaction } from '~/utils/types';
import PrintAccountTransaction from './PrintAccountTransaction';

interface Props {
    transaction: Transaction;
    image?: string;
}

export default function PrintTransaction({ transaction, image }: Props) {
    if (instanceOfAccountTransaction(transaction)) {
        return (
            <PrintAccountTransaction transaction={transaction} image={image} />
        );
    }

    return null;
}
