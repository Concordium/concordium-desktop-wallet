import React from 'react';
import { isExpired } from '~/utils/transactionHelpers';
import {
    Transaction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';

interface Props {
    proposal?: MultiSignatureTransaction;
    transaction: Transaction;
}

export default function ExpiredTransactionView({
    transaction,
    proposal,
}: Props) {
    if (
        (!proposal ||
            proposal.status === MultiSignatureTransactionStatus.Expired) &&
        isExpired(transaction)
    ) {
        return (
            <div className="textError mT10 mono body4">
                The effective time has been exceeded
            </div>
        );
    }
    return null;
}
