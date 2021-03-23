import React from 'react';
import { List, Header } from 'semantic-ui-react';
import {
    TransferToEncrypted,
    TransferToPublic,
    instanceOfTransferToEncrypted,
} from '../../utils/types';
import { displayAsGTU } from '../../utils/gtu';

interface Props {
    transaction: TransferToEncrypted | TransferToPublic;
    fromName?: string;
}

function getDetails(transaction: TransferToEncrypted | TransferToPublic) {
    if (instanceOfTransferToEncrypted(transaction)) {
        return {
            title: 'Shield amount',
            amount: transaction.payload.amount,
        };
    }
    return {
        title: 'Unshield amount',
        amount: transaction.payload.transferAmount,
    };
}

/**
 * Displays an overview of an internal transfer (shield/unshield amount).
 */
export default function DisplayInternalTransfer({
    transaction,
    fromName,
}: Props) {
    const transactionDetails = getDetails(transaction);
    return (
        <List relaxed="very">
            <h2>{transactionDetails.title}</h2>
            <List.Item>
                On Account:
                <Header>{fromName}</Header>
                {transaction.sender}
            </List.Item>
            <List.Item>
                Amount:
                <Header>{displayAsGTU(transactionDetails.amount)}</Header>
            </List.Item>
        </List>
    );
}
