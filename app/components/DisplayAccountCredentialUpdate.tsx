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
    const { addedCredentials, removedCredIds } = transaction.payload;
    return (
        <List relaxed="very">
            <List.Item>
                From Account:
                <Header>{fromName}</Header>
                {transaction.sender}
            </List.Item>
            <List.Item>
                New Threshold:
                {transaction.payload.threshold}
            </List.Item>
            {removedCredIds.length > 0 ? (
                <List.Item>
                    Removed Credentials:
                    {removedCredIds.map((removedId) => (
                        <>
                            <br />
                            <p>{removedId}</p>
                        </>
                    ))}
                </List.Item>
            ) : null}
            {addedCredentials.length > 0 ? (
                <List.Item>
                    Added Credentials:
                    {addedCredentials.map((addedCredential) => (
                        <>
                            <br />
                            <p>{addedCredential.value.credId}</p>
                        </>
                    ))}
                </List.Item>
            ) : null}
        </List>
    );
}
