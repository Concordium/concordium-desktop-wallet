import React from 'react';
import { MultiSignatureTransactionStatus, SimpleTransfer } from '~/utils/types';
import {
    timestamp,
    table,
    sender,
    recipient,
    totalWithdrawn,
    displayAmount,
    fee,
    displayStatus,
    hash,
    standardHeader,
    displayExpiry,
} from '~/utils/printUtility';
import withNames from '~/components/Transfers/withNames';

interface Props {
    transaction: SimpleTransfer;
    status: MultiSignatureTransactionStatus;
    image?: string;
    fromName?: string;
    toName?: string;
}

function PrintFormatScheduledTransfer({
    transaction,
    image,
    status,
    fromName,
    toName,
}: Props) {
    const { amount } = transaction.payload;
    return (
        <>
            <h1>Transaction - Send GTU</h1>
            {timestamp()}
            {table(
                standardHeader,
                <tbody>
                    {sender(transaction.sender, fromName)}
                    {recipient(transaction.payload.toAddress, toName)}
                    {totalWithdrawn(amount, transaction.estimatedFee)}
                    {displayAmount(amount)}
                    {fee(transaction.estimatedFee)}
                    {displayStatus(status)}
                    {status === MultiSignatureTransactionStatus.Open &&
                        displayExpiry(transaction.expiry)}
                    {hash(transaction)}
                    <tr>
                        <td>Identicon:</td>
                    </tr>
                </tbody>
            )}
            <img src={image} alt="" />
        </>
    );
}

export default withNames(PrintFormatScheduledTransfer);
