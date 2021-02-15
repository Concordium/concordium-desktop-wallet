import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import {
    AccountTransaction,
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
    instanceOfSimpleTransfer,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../utils/types';
import findHandler from '../utils/updates/HandlerFinder';
import SimpleTransferDetails from './Transfers/DisplaySimpleTransfer';

// TODO Implement a proper view of the supported transaction types, including account
// transactions.

interface Props {
    transaction:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction;
    toName?: string;
    fromName?: string;
}

function generateView(
    transaction:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction,
    toName?: string,
    fromName?: string
) {
    if (instanceOfUpdateInstruction(transaction)) {
        const handler = findHandler(transaction);
        return handler.view();
    }
    if (instanceOfAccountTransaction(transaction)) {
        if (instanceOfSimpleTransfer(transaction)) {
            return (
                <SimpleTransferDetails
                    transaction={transaction}
                    toName={toName}
                    fromName={fromName}
                />
            );
        }
    }
    throw new Error(`Unsupported transaction type: ${transaction}`);
}

/**
 * Component that displays the details of a transaction in a human readable way.
 * @param {Transaction} transaction: The transaction, which details is displayed.
 * @param {string} transaction: The transaction, which details is displayed.
 * @param {string} toName: Optional parameter for an AccountTransaction, chosen name of the sender.
 * @param {string} fromName: Optional parameter for an AccountTransaction, chosen name of the recipient.
 */
export default function TransactionDetails({
    transaction,
    toName,
    fromName,
}: Props) {
    return (
        <Container>
            <Header>Transaction overview</Header>
            {generateView(transaction, toName, fromName)}
        </Container>
    );
}
