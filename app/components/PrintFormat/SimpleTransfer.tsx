import React from 'react';
import { MultiSignatureTransactionStatus, SimpleTransfer } from '~/utils/types';
import {
    withHeaderAndFooter,
    table,
    sender,
    recipient,
    totalWithdrawn,
    displayAmount,
    fee,
    standardPageFooter,
    displayStatus,
    HashRows,
    standardTableHeader,
    displayExpiry,
    displayMemo,
} from '~/utils/printUtility';
import withNames from '~/components/Transfers/withNames';

interface Props {
    transaction: SimpleTransfer;
    status: MultiSignatureTransactionStatus;
    image?: string;
    fromName?: string;
    toName?: string;
    memo?: string;
}

/**
 * Component that contains the information of a simple
 * Transfer, in a format suited for print.
 */
function PrintFormatSimpleTransfer({
    transaction,
    image,
    status,
    fromName,
    toName,
    memo,
}: Props) {
    const { amount } = transaction.payload;
    const body = (
        <>
            <h1>Transaction - Send CCD</h1>
            {table(
                standardTableHeader,
                <tbody>
                    {sender(transaction.sender, fromName)}
                    {recipient(transaction.payload.toAddress, toName)}
                    {totalWithdrawn(amount, transaction)}
                    {displayAmount(amount)}
                    {fee(transaction)}
                    {memo ? displayMemo(memo) : null}
                    {displayStatus(status)}
                    {status === MultiSignatureTransactionStatus.Open &&
                        displayExpiry(transaction.expiry)}
                    <HashRows transaction={transaction} />
                    {Boolean(image) && (
                        <tr>
                            <td>Identicon:</td>
                        </tr>
                    )}
                </tbody>
            )}
            {Boolean(image) && <img src={image} alt="" />}
        </>
    );
    return withHeaderAndFooter(
        body,
        undefined,
        standardPageFooter(transaction)
    );
}

export default withNames(PrintFormatSimpleTransfer);
