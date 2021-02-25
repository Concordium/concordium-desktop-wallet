import React from 'react';
import { List, Header } from 'semantic-ui-react';
import { TransferToEncrypted } from '../../utils/types';
import { displayAsGTU } from '../../utils/gtu';

interface Props {
    transaction: TransferToEncrypted;
    fromName?: string;
}

/**
 * Displays an overview of a simple transfer.
 */
export default function Display({ transaction, fromName }: Props) {
    return (
        <List relaxed="very">
            <h2>Shield amount:</h2>
            <List.Item>
                On Account:
                <Header>{fromName}</Header>
                {transaction.sender}
            </List.Item>
            <List.Item>
                Amount:
                <Header>{displayAsGTU(transaction.payload.amount)}</Header>
            </List.Item>
        </List>
    );
}
