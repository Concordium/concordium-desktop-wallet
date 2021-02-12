import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import {
    AccountTransaction,
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
    UpdateInstruction,
    UpdateInstructionPayload,
    instanceOfSimpleTransfer,
    instanceOfScheduledTransfer,
} from '../utils/types';
import findHandler from '../utils/updates/HandlerFinder';
import DisplayScheduleTransfer from './Transfers/DisplayScheduledTransferDetails';

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
        const handler = findHandler(transaction);
        return handler.view();
    }
    if (instanceOfAccountTransaction(transaction)) {
        if (instanceOfSimpleTransfer(transaction)) {
            return transaction.toString();
        }
        if (instanceOfScheduledTransfer(transaction)) {
            return <DisplayScheduleTransfer transaction={transaction} />;
        }
    }
    throw new Error(`Unsupported transaction type: ${transaction}`);
}

/**
 * Component that displays the details of a transaction in a human readable way.
 */
export default function TransactionDetails({ transaction }: Props) {
    return (
        <Container>
            <Header>Transaction overview</Header>
            {generateView(transaction)}
        </Container>
    );
}
