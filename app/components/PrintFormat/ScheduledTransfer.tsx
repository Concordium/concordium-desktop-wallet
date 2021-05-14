import React from 'react';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import {
    MultiSignatureTransactionStatus,
    ScheduledTransfer,
    TimeStampUnit,
} from '~/utils/types';
import {
    withHeaderAndFooter,
    table,
    sender,
    recipient,
    totalWithdrawn,
    displayAmount,
    fee,
    displayStatus,
    standardPageFooter,
    hashRow,
    standardTableHeader,
    timeFormat,
    displayExpiry,
} from '~/utils/printUtility';
import { parseTime } from '~/utils/timeHelpers';
import { displayAsGTU } from '~/utils/gtu';
import withNames from '~/components/Transfers/withNames';

interface Props {
    transaction: ScheduledTransfer;
    status: MultiSignatureTransactionStatus;
    image?: string;
    fromName?: string;
    toName?: string;
}

/**
 * Component that contains the information of a scheduled
 * Transfer, in a format suited for print.
 */
function PrintFormatScheduledTransfer({
    transaction,
    image,
    status,
    fromName,
    toName,
}: Props) {
    const amount = getScheduledTransferAmount(transaction);
    const body = (
        <>
            <h1>Transaction - Send GTU with a schedule</h1>
            {table(
                standardTableHeader,
                <tbody>
                    {sender(transaction.sender, fromName)}
                    {recipient(transaction.payload.toAddress, toName)}
                    {totalWithdrawn(amount, transaction.estimatedFee)}
                    {displayAmount(amount)}
                    {fee(transaction.estimatedFee)}
                    {displayStatus(status)}
                    {status === MultiSignatureTransactionStatus.Open &&
                        displayExpiry(transaction.expiry)}
                    {hashRow(transaction)}
                    <tr>
                        <td>Identicon:</td>
                    </tr>
                </tbody>
            )}
            <img src={image} alt="" />
            {table(
                <thead>
                    <tr>
                        <th>Release Time</th>
                        <th>Amount</th>
                    </tr>
                </thead>,
                <tbody>
                    {transaction.payload.schedule.map(
                        (schedulePoint, index) => (
                            <tr
                                key={
                                    schedulePoint.timestamp +
                                    schedulePoint.amount
                                }
                            >
                                <td>
                                    {index + 1}.{' '}
                                    {parseTime(
                                        schedulePoint.timestamp,
                                        TimeStampUnit.milliSeconds,
                                        timeFormat
                                    )}
                                </td>
                                <td>{displayAsGTU(schedulePoint.amount)}</td>
                            </tr>
                        )
                    )}
                </tbody>
            )}
        </>
    );
    return withHeaderAndFooter(
        body,
        undefined,
        standardPageFooter(transaction)
    );
}

export default withNames(PrintFormatScheduledTransfer);
