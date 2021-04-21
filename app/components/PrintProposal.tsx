import React from 'react';
import { parse } from '~/utils/JSONHelper';
import {
    Transaction,
    MultiSignatureTransaction,
    instanceOfAccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfScheduledTransfer,
    TimeStampUnit,
} from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import { collapseFraction } from '~/utils/basicHelpers';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import { parseTime } from '~/utils/timeHelpers';

interface Props {
    proposal: MultiSignatureTransaction;
}

export default function PrintProposal({ proposal }: Props) {
    const transaction: Transaction = parse(proposal.transaction);

    if (instanceOfAccountTransaction(transaction)) {
        if (instanceOfScheduledTransfer(transaction)) {
            return (
                <>
                    <table style={{ width: '100%', textAlign: 'left' }}>
                        <thead>
                            <th>Property</th>
                            <th>Value</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Sender</td>
                                <td>{transaction.sender}</td>
                            </tr>
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
                        <th>Property</th>
                        <th>Value</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Sender</td>
                            <td>{transaction.sender}</td>
                        </tr>
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
                                          collapseFraction(
                                              transaction.estimatedFee
                                          )
                                      )
                                    : 'unknown'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
    }

    return null;
}
