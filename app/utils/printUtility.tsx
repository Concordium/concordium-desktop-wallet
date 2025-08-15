import React, { useEffect, useState } from 'react';
import {
    MultiSignatureTransactionStatus,
    AccountTransaction,
    TimeStampUnit,
    AccountTransactionWithSignature,
} from '~/utils/types';
import {
    getAccountTransactionHash,
    getAccountTransactionSignDigest,
} from './transactionSerialization';
import { displayAsCcd } from '~/utils/ccd';
import { collapseFraction } from '~/utils/basicHelpers';
import { getStatusText } from '~/pages/multisig/ProposalStatus/util';
import { parseTime, getNow } from '~/utils/timeHelpers';
import { useAccount } from './dataHooks';

export function uint8ArrayToHex(array: ArrayBufferLike | undefined): string {
    if (array === undefined) {
        return '';
    }
    return Array.from(new Uint8Array(array))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
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
export const sender = (address: string, name?: string) =>
    account('Sender', address, name);
export const recipient = (address: string, name?: string) =>
    account('Recipient', address, name);

export const totalWithdrawn = (
    microGTUAmount: string | bigint,
    transaction: AccountTransaction
) => {
    if (transaction.cost) {
        return (
            <tr>
                <td>Total amount withdrawn</td>
                <td>
                    {displayAsCcd(
                        BigInt(microGTUAmount) + BigInt(transaction.cost)
                    )}
                </td>
            </tr>
        );
    }
    return (
        <tr>
            <td>Est. total amount withdrawn</td>
            <td>
                {displayAsCcd(
                    BigInt(microGTUAmount) +
                        (transaction.estimatedFee
                            ? collapseFraction(transaction.estimatedFee)
                            : 0n)
                )}
            </td>
        </tr>
    );
};

export const displayAmount = (microGTUAmount: string | bigint) => (
    <tr>
        <td>Amount</td>
        <td>{displayAsCcd(microGTUAmount)}</td>
    </tr>
);

export const fee = (transaction: AccountTransaction) => {
    if (transaction.cost) {
        return (
            <tr>
                <td>Fee</td>
                <td>{displayAsCcd(transaction.cost)}</td>
            </tr>
        );
    }
    return (
        <tr>
            <td>Estimated fee</td>
            <td>
                {transaction.estimatedFee
                    ? displayAsCcd(collapseFraction(transaction.estimatedFee))
                    : 'unknown'}
            </td>
        </tr>
    );
};

type HashRowsProps = {
    transaction: AccountTransactionWithSignature | AccountTransaction;
};

export function HashRows({ transaction }: HashRowsProps) {
    const [digestToSign, setDigestToSign] = useState<string>();
    const [transactionHash, setTransactionHash] = useState<string>();

    const acc = useAccount(transaction.sender);
    const threshold = acc?.signatureThreshold ?? 0;

    useEffect(() => {
        setDigestToSign(
            getAccountTransactionSignDigest(transaction).toString('hex')
        );
        if (
            'signatures' in transaction &&
            Object.keys(transaction.signatures).length >= threshold
        ) {
            setTransactionHash(
                getAccountTransactionHash(
                    transaction,
                    transaction.signatures
                ).toString('hex')
            );
        }
    }, [transaction, threshold]);

    return (
        <>
            <tr>
                <td>Digest to sign</td>
                <td>{digestToSign}</td>
            </tr>
            {'signatures' in transaction &&
            Object.keys(transaction.signatures).length >= threshold ? (
                <tr>
                    <td>Transaction hash</td>
                    <td>{transactionHash}</td>
                </tr>
            ) : null}
        </>
    );
}

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

export const displayMemo = (memo: string) => (
    <tr>
        <td>Memo</td>
        <td
            style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}
        >
            {memo}
        </td>
    </tr>
);

export const displayExpiry = (expiry: bigint) => (
    <tr>
        <td>Expires on</td>
        <td>{parseTime(expiry.toString(), TimeStampUnit.seconds)}</td>
    </tr>
);

const DigestToSignFooter = (transaction: AccountTransaction) => {
    const [digestToSign, setDigestToSign] = useState<string>();

    useEffect(
        () =>
            setDigestToSign(
                getAccountTransactionSignDigest(transaction).toString('hex')
            ),
        [transaction]
    );

    return (
        <p style={{ textAlign: 'right', paddingLeft: '10px' }}>
            Digest to sign: {digestToSign && digestToSign.substring(0, 8)}
            ...
        </p>
    );
};

const timestamp = () => (
    <p style={{ textAlign: 'left', paddingRight: '10px' }}>
        Printed on:{' '}
        {parseTime(
            getNow(TimeStampUnit.seconds).toString(),
            TimeStampUnit.seconds
        )}{' '}
    </p>
);

export const standardPageFooter = (transaction: AccountTransaction) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {DigestToSignFooter(transaction)} {timestamp()}
    </div>
);

export const standardTableHeader = (
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
