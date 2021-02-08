import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import {
    AccountTransaction,
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
    UpdateInstruction,
} from '../utils/types';
import findHandler from '../utils/updates/HandlerFinder';

// TODO Implement a proper view of the supported transaction types, including account
// transactions.

interface Props {
    transaction: UpdateInstruction | AccountTransaction;
}

function generateView(transaction: UpdateInstruction | AccountTransaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        const handler = findHandler(transaction);
        return handler.view();
    }
    if (instanceOfAccountTransaction(transaction)) {
        throw new Error('Not yet implemented.');
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
