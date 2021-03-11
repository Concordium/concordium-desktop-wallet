import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import { getISOFormat } from '../utils/timeHelpers';
import {
    AccountTransaction,
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../utils/types';
import { AccountTransactionWithSignature } from '../utils/transactionTypes';
import { findUpdateInstructionHandler } from '../utils/updates/HandlerFinder';
import AccountTransactionDetails from './Transfers/AccountTransactionDetails';

// TODO Implement a proper view of the supported transaction types, including account
// transactions.

interface Props {
    transaction:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction
        | AccountTransactionWithSignature;
}

function generateView(
    transaction:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction
) {
    if (instanceOfUpdateInstruction(transaction)) {
        const handler = findUpdateInstructionHandler(transaction.type);

        return (
            <>
                {handler.view(transaction)}
                <Header>Effective time</Header>
                {getISOFormat(transaction.header.effectiveTime.toString())}
            </>
        );
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
    return (
        <Container>
            <Header>Transaction overview</Header>
            {generateView(transaction)}
        </Container>
    );
}
