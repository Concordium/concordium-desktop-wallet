import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import Identicon from 'react-identicons';

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
            <Identicon string={transactionHash} size={128} />
            <Header>Transaction hash</Header>
            {transactionHash}
        </Container>
    );
}
