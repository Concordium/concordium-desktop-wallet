import React, { useRef } from 'react';
import { List, Header } from 'semantic-ui-react';
import { SimpleTransfer } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import PrintButton from '~/components/PrintButton';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

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
    const componentRef = useRef();
    return (
        <>
            <PrintButton>
                <List relaxed="very" ref={componentRef}>
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
                        <Header>
                            {displayAsGTU(transaction.payload.amount)}
                        </Header>
                        <DisplayEstimatedFee
                            estimatedFee={transaction.estimatedFee}
                        />
                    </List.Item>
                </List>
            </PrintButton>
            <List relaxed="very" ref={componentRef}>
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
                    <DisplayEstimatedFee
                        estimatedFee={transaction.estimatedFee}
                    />
                </List.Item>
            </List>
        </>
    );
}
