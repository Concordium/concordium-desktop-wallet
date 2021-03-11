import React from 'react';
import { List, Header } from 'semantic-ui-react';
import { UpdateAccountCredentials } from '../utils/types';

interface Props {
    transaction: UpdateAccountCredentials;
    fromName?: string;
}

/**
 * Displays an overview of a credential update transaction.
 */
export default function DisplayAccountCredentialUpdate({
    transaction,
    fromName,
}: Props) {
    return (
        <List relaxed="very">
            <List.Item>
                From Account:
                <Header>{fromName}</Header>
                {transaction.sender}
            </List.Item>
            <List.Item>
                New Threshold:
                {transaction.payload.newThreshold}
            </List.Item>
            <List.Item />
        </List>
    );
}
