import React from 'react';
import { List, Header } from 'semantic-ui-react';
import { AddBaker } from '~/utils/types';
import { useAccountName } from '~/utils/hooks';

interface Props {
    transaction: AddBaker;
}

/**
 * Displays an overview of remove baker transaction.
 */
export default function DisplayRemoveBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);

    return (
        <List relaxed="very">
            <List.Item>
                From Account:
                <Header>{senderName}</Header>
                {transaction.sender}
            </List.Item>
        </List>
    );
}
