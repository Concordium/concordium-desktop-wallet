import React, { useState, useEffect } from 'react';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfScheduledTransfer,
    TimeStampUnit,
} from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import { collapseFraction } from '~/utils/basicHelpers';
import {
    getScheduledTransferAmount,
    lookupName,
} from '~/utils/transactionHelpers';
import { parseTime } from '~/utils/timeHelpers';

interface Props {
    transaction: AccountTransaction;
}

export default function PrintAccountTransactionProposal({
    transaction,
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

    if (!fromName) {
        return null;
    }

    if (instanceOfScheduledTransfer(transaction)) {
        return (
            <>
                <table style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Sender Name</td>
                            <td>{fromName}</td>
                        </tr>
                        <tr>
                            <td>Sender</td>
                            <td>{transaction.sender}</td>
                        </tr>
                        {fromName && (
                            <tr>
                                <td>Recipient Name</td>
                                <td>{toName}</td>
                            </tr>
                        )}
                        <tr>
                            <td>Recipient</td>
                            <td>{transaction.payload.toAddress}</td>
                        </tr>
                        <tr>
                            <td>Total Amount</td>
                            <td>
                                {displayAsGTU(
                                    getScheduledTransferAmount(transaction)
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>Estimated fee</td>
                            <td>
                                {transaction.estimatedFee
                                    ? displayAsGTU(
                                          collapseFraction(
                                              transaction.estimatedFee
                                          )
                                      )
                                    : 'unknown'}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table
                    style={{
                        marginTop: '40px',
                        width: '100%',
                        textAlign: 'left',
                    }}
                >
                    <thead>
                        <th>Release Time</th>
                        <th>Amount</th>
                    </thead>
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
                </table>
            </>
        );
    }
    if (instanceOfSimpleTransfer(transaction)) {
        return (
            <table style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Sender Name</td>
                        <td>{fromName}</td>
                    </tr>
                    <tr>
                        <td>Sender</td>
                        <td>{transaction.sender}</td>
                    </tr>
                    {fromName && (
                        <tr>
                            <td>Recipient Name</td>
                            <td>{toName}</td>
                        </tr>
                    )}
                    <tr>
                        <td>Recipient</td>
                        <td>{transaction.payload.toAddress}</td>
                    </tr>
                    <tr>
                        <td>Amount</td>
                        <td>{displayAsGTU(transaction.payload.amount)}</td>
                    </tr>
                    <tr>
                        <td>Estimated fee</td>
                        <td>
                            {transaction.estimatedFee
                                ? displayAsGTU(
                                      collapseFraction(transaction.estimatedFee)
                                  )
                                : 'unknown'}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    return null;
}
