import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import { AccountTransaction, UpdateInstruction } from '../utils/types';

// TODO Implement a proper view of the supported transaction types, including account
// transactions.

interface Props {
    transaction: UpdateInstruction | AccountTransaction;
}

/**
 * Component that displays the details of a transaction in a human readable way.
 */
export default function TransactionDetails({ transaction }: Props) {
    return (
        <Container>
            <Header>Transaction overview</Header>
            {JSON.stringify(transaction.payload)}
        </Container>
    );
}
