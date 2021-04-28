import React from 'react';
import {
    Transaction,
    instanceOfAccountTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import PrintAccountTransaction from './PrintAccountTransaction';

interface Props {
    transaction: Transaction;
    status: MultiSignatureTransactionStatus;
    image?: string;
}

export default function PrintTransaction({
    transaction,
    image,
    status,
}: Props) {
    if (instanceOfAccountTransaction(transaction)) {
        return (
            <PrintAccountTransaction
                transaction={transaction}
                image={image}
                status={status}
            />
        );
    }

    return null;
}
