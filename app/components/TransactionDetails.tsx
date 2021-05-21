import React from 'react';
import {
    Transaction,
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
} from '../utils/types';
import AccountTransactionDetails from './Transfers/AccountTransactionDetails';
import UpdateInstructionDetails from './UpdateInstructionDetails';

interface Props {
    transaction: Transaction;
}

function generateView(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return <UpdateInstructionDetails transaction={transaction} />;
    }
    if (instanceOfAccountTransaction(transaction)) {
        return <AccountTransactionDetails transaction={transaction} />;
    }
    throw new Error(`Unsupported transaction type: ${transaction}`);
}

/**
 * Component that displays the details of a transaction in a human readable way.
 * @param {Transaction} transaction: The transaction, which details is displayed.
 */
export default function TransactionDetails({ transaction }: Props) {
    return generateView(transaction);
}
