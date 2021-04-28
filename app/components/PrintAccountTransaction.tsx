import React, { useState, useEffect } from 'react';
import {
    MultiSignatureTransactionStatus,
    AccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfScheduledTransfer,
    TimeStampUnit,
    Fraction,
} from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import { collapseFraction } from '~/utils/basicHelpers';
import {
    getScheduledTransferAmount,
    lookupName,
} from '~/utils/transactionHelpers';
import { parseTime, getNow } from '~/utils/timeHelpers';
import getTransactionHash from '~/utils/transactionHash';
import { getStatusText } from '~/pages/multisig/ProposalStatus/util';

interface Props {
    transaction: AccountTransaction;
    status: MultiSignatureTransactionStatus;
    image?: string;
}

const timeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'medium',
};

const account = (title: string, address: string, name?: string) => (
    <>
        {name && (
            <tr>
                <td>{title} Name</td>
                <td>{name}</td>
            </tr>
        )}
        <tr>
            <td>{title}</td>
            <td>{address}</td>
        </tr>
    </>
);
const sender = (address: string, name?: string) =>
    account('Sender', address, name);
const recipient = (address: string, name?: string) =>
    account('Recipient', address, name);

const totalWithdrawn = (
    microGTUAmount: string | bigint,
    estimatedFee: Fraction | undefined
) => (
    <tr>
        <td>Est. total amount withdrawn</td>
        <td>
            {displayAsGTU(
                BigInt(microGTUAmount) +
                    (estimatedFee ? collapseFraction(estimatedFee) : 0n)
            )}
        </td>
    </tr>
);

const displayAmount = (microGTUAmount: string | bigint) => (
    <tr>
        <td>Amount</td>
        <td>{displayAsGTU(microGTUAmount)}</td>
    </tr>
);

const fee = (estimatedFee?: Fraction) => (
    <tr>
        <td>Estimated fee</td>
        <td>
            {estimatedFee
                ? displayAsGTU(collapseFraction(estimatedFee))
                : 'unknown'}
        </td>
    </tr>
);

const hash = (transaction: AccountTransaction) => (
    <tr>
        <td>Transaction hash</td>
        <td>{getTransactionHash(transaction)}</td>
    </tr>
);

function getStatusColor(
    status: MultiSignatureTransactionStatus
): string | undefined {
    if (status === MultiSignatureTransactionStatus.Submitted) {
        return '#303982';
    }
    if (
        [
            MultiSignatureTransactionStatus.Expired,
            MultiSignatureTransactionStatus.Rejected,
            MultiSignatureTransactionStatus.Failed,
        ].includes(status)
    ) {
        return '#ff8a8a';
    }
    if (status === MultiSignatureTransactionStatus.Finalized) {
        return '#4ac29e';
    }
    return undefined;
}

const displayStatus = (status: MultiSignatureTransactionStatus) => (
    <tr>
        <td>Status</td>
        <td style={{ color: getStatusColor(status) }}>
            {getStatusText(status)}
        </td>
    </tr>
);

const timestamp = () => (
    <p style={{ position: 'absolute', right: '10px', bottom: '0px' }}>
        Printed on:{' '}
        {parseTime(
            getNow(TimeStampUnit.seconds).toString(),
            TimeStampUnit.seconds,
            timeFormat
        )}{' '}
    </p>
);

const standardHeader = (
    <thead>
        <tr>
            <th>Property</th>
            <th>Value</th>
        </tr>
    </thead>
);

const table = (header: JSX.Element, body: JSX.Element) => (
    <table style={{ width: '100%', textAlign: 'left' }}>
        {header}
        {body}
    </table>
);

export default function PrintAccountTransaction({
    transaction,
    image,
    status,
}: Props) {
    const [fromName, setFromName] = useState<string | undefined>();
    const [toName, setToName] = useState<string | undefined>();

    useEffect(() => {
        lookupName(transaction.sender)
            .then((name) => setFromName(name))
            .catch(() => {}); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
        if ('toAddress' in transaction.payload) {
            lookupName(transaction.payload.toAddress)
                .then((name) => setToName(name))
                .catch(() => {}); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
        }
    });

    if (instanceOfScheduledTransfer(transaction)) {
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
                                    <td>
                                        {displayAsGTU(schedulePoint.amount)}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                )}
            </>
        );
    }
    if (instanceOfSimpleTransfer(transaction)) {
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

    return null;
}
