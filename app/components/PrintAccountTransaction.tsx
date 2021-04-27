import React, { useState, useEffect } from 'react';
import {
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
import { parseTime } from '~/utils/timeHelpers';
import getTransactionHash from '~/utils/transactionHash';

interface Props {
    transaction: AccountTransaction;
    image?: string;
}

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

const amount = (microGTUAmount: string | bigint) => (
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

export default function PrintAccountTransaction({ transaction, image }: Props) {
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
        return (
            <>
                <h1>Transaction - Send GTU with a schedule</h1>
                {table(
                    standardHeader,
                    <tbody>
                        {sender(transaction.sender, fromName)}
                        {recipient(transaction.payload.toAddress, toName)}
                        {amount(getScheduledTransferAmount(transaction))}
                        {fee(transaction.estimatedFee)}
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
                                            TimeStampUnit.milliSeconds
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
        return (
            <>
                <h1>Transaction - Send GTU</h1>
                {table(
                    standardHeader,
                    <tbody>
                        {sender(transaction.sender, fromName)}
                        {recipient(transaction.payload.toAddress, toName)}
                        {amount(transaction.payload.amount)}
                        {fee(transaction.estimatedFee)}
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
