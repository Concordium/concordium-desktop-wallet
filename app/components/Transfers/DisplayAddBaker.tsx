import React from 'react';
import { List, Header } from 'semantic-ui-react';
import { AddBaker } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { useAccountName } from '~/utils/hooks';

interface Props {
    transaction: AddBaker;
}

/**
 * Displays an overview of a simple transfer.
 */
export default function DisplayAddBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);

    return (
        <List relaxed="very">
            <List.Item>
                From Account:
                <Header>{senderName}</Header>
                {transaction.sender}
            </List.Item>
            <List.Item>
                Stake:
                <Header>{displayAsGTU(transaction.payload.bakingStake)}</Header>
                <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            </List.Item>
            <List.Item>
                Restake earnings:
                <Header>
                    {transaction.payload.restakeEarnings ? 'Yes' : 'No'}
                </Header>
            </List.Item>
        </List>
    );
}
