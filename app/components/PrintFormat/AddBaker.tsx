import React from 'react';
import { AddBaker, MultiSignatureTransactionStatus } from '~/utils/types';
import {
    timestamp,
    table,
    sender,
    totalWithdrawn,
    fee,
    displayStatus,
    hash,
    standardHeader,
    displayExpiry,
} from '~/utils/printUtility';
import withNames from '~/components/Transfers/withNames';

interface Props {
    transaction: AddBaker;
    status: MultiSignatureTransactionStatus;
    image?: string;
    fromName?: string;
}

/**
 * Component that contains the information of a Add-Baker-Transaction, in a
 * format suited for print.
 */
function PrintFormatAddBaker({ transaction, image, status, fromName }: Props) {
    return (
        <>
            <h1>Transaction - Add Baker</h1>
            {timestamp()}
            {table(
                standardHeader,
                <tbody>
                    {sender(transaction.sender, fromName)}
                    {totalWithdrawn('0', transaction.estimatedFee)}
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

export default withNames(PrintFormatAddBaker);
