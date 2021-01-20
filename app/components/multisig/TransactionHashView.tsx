import React from 'react';
import { Container, Header, Icon } from 'semantic-ui-react';

// TODO Compute identicon for the hash and display it.

interface Props {
    transactionHash: string;
}

/**
 * Component that displays the hash and an identicon of the hash so that a user
 * can verify the integrity of a received transaction before signing it.
 */
export default function TransactionHashView({ transactionHash }: Props) {
    return (
        <Container>
            <Header>Transaction identicon</Header>
            <Icon name="random" size="huge" />
            <Header>Transaction hash</Header>
            {transactionHash}
        </Container>
    );
}
