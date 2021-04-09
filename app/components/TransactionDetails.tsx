import React from 'react';
import {
    AccountTransaction,
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../utils/types';
import AccountTransactionDetails from './Transfers/AccountTransactionDetails';
import UpdateInstructionDetails from './UpdateInstructionDetails';

// TODO Implement a proper view of the supported transaction types, including account
// transactions.

interface Props {
    transaction:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction;
}

function generateView(
    transaction:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction
) {
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
