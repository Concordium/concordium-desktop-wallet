import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import { UpdateInstruction } from '../utils/types';

interface Props {
    updateInstruction: UpdateInstruction;
}

/**
 * Component that displays the details of a transaction in a human readable way.
 */
export default function TransactionDetails({ updateInstruction }: Props) {
    return (
        <Container>
            <Header>Transaction overview</Header>
            {JSON.stringify(updateInstruction.payload)}
        </Container>
    );
}
