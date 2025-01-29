import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import DoubleCheckmarkIcon from '@resources/svg/double-grey-checkmark.svg';
import CheckmarkIcon from '@resources/svg/grey-checkmark.svg';
import Warning from '@resources/svg/warning.svg';
import { dateFromTimeStamp, parseTime } from '~/utils/timeHelpers';
import { displayAsCcd } from '~/utils/ccd';

import {
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
    TransferTransactionWithNames,
    TimeStampUnit,
    ClassNameAndStyle,
} from '~/utils/types';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { viewingShieldedSelector } from '~/features/TransactionSlice';
import SidedRow from '~/components/SidedRow';
import {
    isFailed,
    isTransferKind,
    isRewardKind,
    isOutgoingTransaction,
} from '~/utils/transactionHelpers';
import transactionKindNames from '~/constants/transactionKindNames.json';

import styles from './TransactionList.module.scss';

const isInternalTransfer = (transaction: TransferTransaction) =>
    [
        TransactionKindString.TransferToEncrypted,
        TransactionKindString.TransferToPublic,
    ].includes(transaction.transactionKind);

const strikeThroughAmount = (
    transaction: TransferTransaction,
    viewingShielded: boolean,
    isOutgoing: boolean
) =>
    transaction.status === TransactionStatus.Rejected ||
    (transaction.status === TransactionStatus.Failed && viewingShielded) ||
    (transaction.status === TransactionStatus.Failed && !isOutgoing);

const isGreen = (
    transaction: TransferTransaction,
    viewingShielded: boolean,
    isOutgoing: boolean
) => {
    if (isFailed(transaction)) {
        return false;
    }
    const kind = transaction.transactionKind;
    if (TransactionKindString.TransferToEncrypted === kind) {
        return viewingShielded;
    }
    if (TransactionKindString.TransferToPublic === kind) {
        if (
            transaction.subtotal === undefined ||
            transaction.cost === undefined
        ) {
            throw new Error('missing fields for transaction');
        }
        return (
            !viewingShielded &&
            BigInt(transaction.subtotal) > BigInt(transaction.cost)
        );
    }
    return !isOutgoing;
};

function getName(
    transaction: TransferTransactionWithNames,
    isOutgoing: boolean
) {
    if (isInternalTransfer(transaction)) {
        return '';
    }
    if (isOutgoing) {
        // Current Account is the sender
        if (transaction.toName !== undefined) {
            return transaction.toName;
        }
        return transaction.toAddress.slice(0, 6);
    }
    if (transaction.fromName !== undefined) {
        return transaction.fromName;
    }
    return transaction.fromAddress.slice(0, 6);
}

function buildOutgoingAmountStrings(subtotal: bigint, fee: bigint) {
    return {
        amount: `${displayAsCcd(-(subtotal + fee))}`,
        amountFormula: `${displayAsCcd(BigInt(subtotal))} + ${displayAsCcd(
            fee
        )} Fee`,
    };
}

function buildCostString(fee: bigint) {
    return {
        amount: `${displayAsCcd(-fee)}`,
        amountFormula: `${displayAsCcd(fee)} Fee`,
    };
}

function buildCostFreeAmountString(amount: bigint, flipSign = false) {
    const displayAmount = flipSign ? -amount : amount;
    return {
        amount: `${displayAsCcd(displayAmount)}`,
        amountFormula: '',
    };
}

function parseShieldedAmount(
    transaction: TransferTransaction,
    isOutgoing: boolean
) {
    if (transaction.decryptedAmount) {
        if (isInternalTransfer(transaction)) {
            return buildCostFreeAmountString(
                BigInt(transaction.decryptedAmount)
            );
        }
        if (
            [
                TransactionKindString.EncryptedAmountTransfer,
                TransactionKindString.EncryptedAmountTransferWithMemo,
            ].includes(transaction.transactionKind)
        ) {
            return buildCostFreeAmountString(
                BigInt(transaction.decryptedAmount),
                isOutgoing
            );
        }
        return buildCostFreeAmountString(BigInt(transaction.decryptedAmount));
    }
    return {
        amount: '',
        amountFormula: '',
    };
}

function parseAmount(transaction: TransferTransaction, isOutgoing: boolean) {
    if (isTransferKind(transaction.transactionKind)) {
        if (transaction.subtotal === undefined) {
            throw new Error('missing tx fields');
        }

        if (isOutgoing) {
            const cost = BigInt(transaction.cost || '0');

            if (transaction.status === TransactionStatus.Failed) {
                return buildCostString(cost);
            }

            if (
                [
                    TransactionKindString.EncryptedAmountTransfer,
                    TransactionKindString.EncryptedAmountTransferWithMemo,
                ].includes(transaction.transactionKind)
            ) {
                return {
                    amount: `${displayAsCcd(-cost)}`,
                    amountFormula: `Shielded transaction fee`,
                };
            }

            if (
                TransactionKindString.TransferToPublic ===
                transaction.transactionKind
            ) {
                // A transfer to public is the only transaction, where we pay a cost and receive ccd on the public balance.
                return buildOutgoingAmountStrings(
                    -BigInt(transaction.subtotal),
                    cost
                );
            }

            return buildOutgoingAmountStrings(
                BigInt(transaction.subtotal),
                cost
            );
        }
        // incoming transaction:
        return buildCostFreeAmountString(BigInt(transaction.subtotal));
    }
    if (isRewardKind(transaction.transactionKind)) {
        if (transaction.subtotal === undefined) {
            throw new Error('missing tx fields');
        }
        return buildCostFreeAmountString(BigInt(transaction.subtotal));
    }
    return buildCostString(BigInt(transaction.cost || '0'));
}

function displayType(kind: TransactionKindString, failed: boolean) {
    switch (kind) {
        case TransactionKindString.TransferWithSchedule:
        case TransactionKindString.TransferWithScheduleAndMemo:
            if (!failed) {
                return <i className="mL10">(With schedule)</i>;
            }
            break;
        case TransactionKindString.EncryptedAmountTransfer:
        case TransactionKindString.EncryptedAmountTransferWithMemo:
        case TransactionKindString.Transfer:
        case TransactionKindString.TransferWithMemo:
            if (!failed) {
                return '';
            }
            break;
        default:
            break;
    }
    return <i>{transactionKindNames[kind]}</i>;
}

function statusSymbol(status: TransactionStatus) {
    switch (status) {
        case TransactionStatus.Pending:
            return '';
        case TransactionStatus.Committed:
            return <CheckmarkIcon className={styles.checkmark} height="10" />;
        case TransactionStatus.Failed:
        case TransactionStatus.Finalized:
            return (
                <DoubleCheckmarkIcon className={styles.checkmark} height="10" />
            );
        case TransactionStatus.Rejected:
            return '!';
        default:
            return '?';
    }
}

/**
 * Displays the memo, either partially or fully or message if absent.
 */
function showMemo(
    memo: string | undefined,
    showFullMemo: boolean,
    transactionKind: TransactionKindString
) {
    if (
        !memo &&
        showFullMemo &&
        [
            TransactionKindString.Transfer,
            TransactionKindString.EncryptedAmountTransfer,
            TransactionKindString.TransferWithSchedule,
        ].includes(transactionKind)
    ) {
        // If we are fully showing the memo, and the type is one that has a memo version, but there is no memo:
        return (
            <i className="body5 m0 textFaded">
                The transaction contains no memo
            </i>
        );
    }
    if (!memo) {
        return null;
    }
    return (
        <pre
            className={clsx(
                'body5 m0 textFaded',
                showFullMemo && styles.fullMemo,
                showFullMemo || styles.lineClamp
            )}
        >
            {memo}
        </pre>
    );
}

const onlyTime = Intl.DateTimeFormat(undefined, {
    timeStyle: 'medium',
    hourCycle: 'h23',
}).format;

export const transactionListElementHeight = 58;

interface Props extends ClassNameAndStyle {
    transaction: TransferTransaction;
    onClick?: () => void;
    showDate?: boolean;
    showFullMemo?: boolean;
}

/**
 * Displays the given transaction basic information.
 */
function TransactionListElement({
    transaction,
    onClick,
    showFullMemo = false,
    showDate = false,
    className,
    style = { height: transactionListElementHeight },
}: Props): JSX.Element {
    const account = useSelector(chosenAccountSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);
    if (!account) {
        throw new Error('Unexpected missing chosen account');
    }
    const isOutgoing = isOutgoingTransaction(transaction, account.address);
    const time = showDate
        ? parseTime(transaction.blockTime)
        : onlyTime(
              dateFromTimeStamp(transaction.blockTime, TimeStampUnit.seconds)
          );
    const name = getName(transaction, isOutgoing);
    const amountParser = viewingShielded ? parseShieldedAmount : parseAmount;
    const { amount, amountFormula } = amountParser(transaction, isOutgoing);

    const failed = isFailed(transaction);
    const notFinished = [
        TransactionStatus.Committed,
        TransactionStatus.Pending,
    ].includes(transaction.status);

    return (
        <div
            className={clsx(
                styles.transactionListElement,
                style.height || styles.transactionListElementVariableHeight,
                !failed || styles.failedElement,
                Boolean(onClick) && styles.clickableElement,
                className
            )}
            style={style}
            onClick={onClick}
            onKeyPress={onClick}
            tabIndex={0}
            role="button"
        >
            {failed ? <Warning className={styles.warning} height="20" /> : null}
            <SidedRow
                left={
                    <>
                        {failed || name}
                        {displayType(transaction.transactionKind, failed)}
                    </>
                }
                right={
                    <p
                        className={clsx(
                            'mV0',
                            strikeThroughAmount(
                                transaction,
                                viewingShielded,
                                isOutgoing
                            ) && styles.strikedThrough,
                            isGreen(transaction, viewingShielded, isOutgoing) &&
                                styles.greenText
                        )}
                    >
                        {amount}
                    </p>
                }
            />
            <SidedRow
                className="body5 textFaded"
                left={
                    <>
                        {time} {statusSymbol(transaction.status)}
                    </>
                }
                right={
                    amountFormula
                        ? amountFormula.concat(
                              ` ${notFinished ? ' (Estimated)' : ''}`
                          )
                        : ''
                }
            />
            {showMemo(
                transaction.memo,
                showFullMemo,
                transaction.transactionKind
            )}
        </div>
    );
}

export default TransactionListElement;
