import React from 'react';
import {
    MultiSignatureTransactionStatus,
    AccountTransaction,
    TimeStampUnit,
    Fraction,
} from '~/utils/types';
import { getAccountTransactionHash } from './transactionSerialization';
import { displayAsGTU } from '~/utils/gtu';
import { collapseFraction } from '~/utils/basicHelpers';
import { getStatusText } from '~/pages/multisig/ProposalStatus/util';
import { parseTime, getNow } from '~/utils/timeHelpers';

export const timeFormat: Intl.DateTimeFormatOptions = {
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
export const sender = (address: string, name?: string) =>
    account('Sender', address, name);
export const recipient = (address: string, name?: string) =>
    account('Recipient', address, name);

export const totalWithdrawn = (
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

export const displayAmount = (microGTUAmount: string | bigint) => (
    <tr>
        <td>Amount</td>
        <td>{displayAsGTU(microGTUAmount)}</td>
    </tr>
);

export const fee = (estimatedFee?: Fraction) => (
    <tr>
        <td>Estimated fee</td>
        <td>
            {estimatedFee
                ? displayAsGTU(collapseFraction(estimatedFee))
                : 'unknown'}
        </td>
    </tr>
);

export const hash = (transaction: AccountTransaction) => (
    <tr>
        <td>Signing hash</td>
        <td>
            {getAccountTransactionHash(transaction, () => []).toString('hex')}
        </td>
    </tr>
);

export function getStatusColor(
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

export const displayStatus = (status: MultiSignatureTransactionStatus) => (
    <tr>
        <td>Status</td>
        <td style={{ color: getStatusColor(status) }}>
            {getStatusText(status)}
        </td>
    </tr>
);

export const displayExpiry = (expiry: bigint) => (
    <tr>
        <td>Expires on</td>
        <td>
            {parseTime(expiry.toString(), TimeStampUnit.seconds, timeFormat)}
        </td>
    </tr>
);

export const timestamp = () => (
    <p style={{ textAlign: 'right' }}>
        Printed on:{' '}
        {parseTime(
            getNow(TimeStampUnit.seconds).toString(),
            TimeStampUnit.seconds,
            timeFormat
        )}{' '}
    </p>
);

export const standardHeader = (
    <thead>
        <tr>
            <th>Property</th>
            <th>Value</th>
        </tr>
    </thead>
);

export const table = (header: JSX.Element, body: JSX.Element) => (
    <table style={{ width: '100%', textAlign: 'left' }}>
        {header}
        {body}
    </table>
);

const headerFooterSize = '50px';
export const withHeaderAndFooter = (
    content: JSX.Element,
    header?: JSX.Element,
    footer?: JSX.Element
) => {
    const headerSize = header ? headerFooterSize : '0';
    const footerSize = footer ? headerFooterSize : '0';
    return (
        <>
            <div
                style={{
                    width: '100%',
                    height: headerSize,
                    position: 'fixed',
                    top: '0',
                }}
            >
                {header}
            </div>
            <div
                style={{
                    width: '100%',
                    height: footerSize,
                    position: 'fixed',
                    bottom: '0',
                }}
            >
                {footer}
            </div>
            <table>
                <thead>
                    <tr>
                        <td>
                            <div style={{ height: headerSize }}>&nbsp;</div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div>{content}</div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td>
                            <div style={{ height: footerSize }}>&nbsp;</div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </>
    );
};
