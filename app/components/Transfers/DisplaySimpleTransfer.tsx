import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { List, Header } from 'semantic-ui-react';
import { SimpleTransfer } from '../../utils/types';
import { displayAsGTU } from '../../utils/gtu';
import { lookupName } from '../../utils/transactionHelpers';
import { chosenAccountSelector } from '../../features/AccountSlice';

interface Props {
    transaction: SimpleTransfer;
}

/**
 * Displays an overview of a simple transfer.
 */
export default function DisplaySimpleTransfer({ transaction }: Props) {
    const account = useSelector(chosenAccountSelector);
    const fromName = account?.name;
    const [toName, setToName] = useState<string | undefined>();

    useEffect(() => {
        lookupName(transaction.payload.toAddress)
            .then((name) => setToName(name))
            .catch(() => {});
    });

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
                Amount:
                <Header>{displayAsGTU(transaction.payload.amount)}</Header>
            </List.Item>
        </List>
    );
}
