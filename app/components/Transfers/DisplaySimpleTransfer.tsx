import React from 'react';
import { List, Header } from 'semantic-ui-react';
import { SimpleTransfer } from '../../utils/types';
import { displayAsGTU } from '../../utils/gtu';

interface Props {
    transaction: SimpleTransfer;
    fromName?: string;
    toName?: string;
}

/**
 * Displays an overview of a simple transfer.
 */
export default function DisplaySimpleTransfer({
    transaction,
    fromName,
    toName,
}: Props) {
    return (
        <List relaxed="very">
            <List.Item>
                From Account:
                <Header>{fromName}</Header>
                {transaction.sender}
            </List.Item>
            <List.Item>
                To Account:
                <Header>{toName} </Header>
                {transaction.payload.toAddress}
            </List.Item>
            <List.Item>
                {' '}
                Amount:
                <Header>{displayAsGTU(transaction.payload.amount)}</Header>
            </List.Item>
        </List>
    );
}
