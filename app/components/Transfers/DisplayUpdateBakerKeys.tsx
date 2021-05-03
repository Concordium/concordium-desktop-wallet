import React from 'react';
import { List, Header } from 'semantic-ui-react';
import { UpdateBakerKeys } from '~/utils/types';
import { useAccountName } from '~/utils/hooks';

interface Props {
    transaction: UpdateBakerKeys;
}

/**
 * Displays an overview of an Update Baker Keys transaction.
 */
export default function DisplayUpdateBakerKeys({ transaction }: Props) {
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
