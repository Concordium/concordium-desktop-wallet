import React from 'react';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import {
    MultiSignatureTransactionStatus,
    ScheduledTransfer,
    TimeStampUnit,
} from '~/utils/types';
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

function PrintFormatScheduledTransfer({
    transaction,
    image,
    status,
    fromName,
    toName,
}: Props) {
    const amount = getScheduledTransferAmount(transaction);
    return (
        <>
            <h1>Transaction - Send GTU with a schedule</h1>
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
}

export default withNames(PrintFormatScheduledTransfer);
