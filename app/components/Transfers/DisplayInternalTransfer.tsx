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

function getTitle(transaction: TransferToEncrypted | TransferToPublic) {
    if (instanceOfTransferToEncrypted(transaction)) {
        return 'Shield amount';
    }
    return 'Unshield amount';
}

function getAmount(transaction: TransferToEncrypted | TransferToPublic) {
    if (instanceOfTransferToEncrypted(transaction)) {
        return transaction.payload.amount;
    }
    return transaction.payload.transferAmount;
}

/**
 * Displays an overview of an internal transfer (shield/unshield amount).
 */
export default function DisplayInternalTransfer({
    transaction,
    fromName,
}: Props) {
    return (
        <List relaxed="very">
            <h2>{getTitle(transaction)}</h2>
            <List.Item>
                On Account:
                <Header>{fromName}</Header>
                {transaction.sender}
            </List.Item>
            <List.Item>
                Amount:
                <Header>{displayAsGTU(getAmount(transaction))}</Header>
            </List.Item>
        </List>
    );
}
