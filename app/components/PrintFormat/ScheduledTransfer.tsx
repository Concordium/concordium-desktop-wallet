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
    HashRows,
    standardTableHeader,
    displayExpiry,
    displayMemo,
} from '~/utils/printUtility';
import { parseTime } from '~/utils/timeHelpers';
import { displayAsCcd } from '~/utils/ccd';
import withNames from '~/components/Transfers/withNames';

interface Props {
    transaction: ScheduledTransfer;
    status: MultiSignatureTransactionStatus;
    image?: string;
    fromName?: string;
    toName?: string;
    memo?: string;
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
    memo,
}: Props) {
    const amount = getScheduledTransferAmount(transaction);
    const body = (
        <>
            <h1>Transaction - Send CCD with a schedule</h1>
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
            {table(
                <thead>
                    <tr>
                        <th>Release time</th>
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
                                        TimeStampUnit.milliSeconds
                                    )}
                                </td>
                                <td>{displayAsCcd(schedulePoint.amount)}</td>
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
