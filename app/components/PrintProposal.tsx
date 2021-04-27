import React from 'react';
import { parse } from '~/utils/JSONHelper';
import {
    Transaction,
    MultiSignatureTransaction,
    instanceOfAccountTransaction,
} from '~/utils/types';
import PrintAccountTransactionProposal from './PrintAccountTransactionProposal';

interface Props {
    proposal: MultiSignatureTransaction;
}

export default function PrintProposal({ proposal }: Props) {
    const transaction: Transaction = parse(proposal.transaction);

    if (instanceOfAccountTransaction(transaction)) {
        return <PrintAccountTransactionProposal transaction={transaction} />;
    }

    return null;
}
