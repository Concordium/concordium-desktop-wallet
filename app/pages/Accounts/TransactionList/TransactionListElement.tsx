import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import DoubleCheckmarkIcon from '@resources/svg/double-grey-checkmark.svg';
import CheckmarkIcon from '@resources/svg/grey-checkmark.svg';
import Warning from '@resources/svg/warning.svg';
import { dateFromTimeStamp, parseTime } from '~/utils/timeHelpers';
import { displayAsGTU } from '~/utils/gtu';

import {
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
    TransferTransactionWithNames,
    TimeStampUnit,
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

import styles from '../Transactions.module.scss';

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
        amount: `${displayAsGTU(-(subtotal + fee))}`,
        amountFormula: `${displayAsGTU(BigInt(subtotal))} + ${displayAsGTU(
            fee
        )} Fee`,
    };
}

function buildCostString(fee: bigint) {
    return {
        amount: `${displayAsGTU(-fee)}`,
        amountFormula: `${displayAsGTU(fee)} Fee`,
    };
}

function buildCostFreeAmountString(amount: bigint, flipSign = false) {
    const displayAmount = flipSign ? -amount : amount;
    return {
        amount: `${displayAsGTU(displayAmount)}`,
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
            transaction.transactionKind ===
            TransactionKindString.EncryptedAmountTransfer
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
        if (isOutgoing) {
            const cost = BigInt(transaction.cost || '0');

            if (transaction.status === TransactionStatus.Failed) {
                return buildCostString(cost);
            }

            if (
                transaction.transactionKind ===
                TransactionKindString.EncryptedAmountTransfer
            ) {
                return {
                    amount: `${displayAsGTU(-cost)}`,
                    amountFormula: `Shielded transaction fee`,
                };
            }

            if (
                TransactionKindString.TransferToPublic ===
                transaction.transactionKind
            ) {
                // A transfer to public is the only transaction, where we pay a cost and receive gtu on the public balance.
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
        return buildCostFreeAmountString(BigInt(transaction.subtotal));
    }
    return buildCostString(BigInt(transaction.cost || '0'));
}

function displayType(kind: TransactionKindString, failed: boolean) {
    switch (kind) {
        case TransactionKindString.TransferWithSchedule:
            if (!failed) {
                return <i className="mL10">(With schedule)</i>;
            }
            break;
        case TransactionKindString.EncryptedAmountTransfer:
        case TransactionKindString.Transfer:
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

const onlyTime = Intl.DateTimeFormat(undefined, {
    timeStyle: 'medium',
    hourCycle: 'h24',
}).format;

interface Props {
    transaction: TransferTransaction;
    onClick?: () => void;
    showDate?: boolean;
}

/**
 * Displays the given transaction basic information.
 */
function TransactionListElement({
    transaction,
    onClick,
    showDate = false,
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
                !failed || styles.failedElement,
                Boolean(onClick) && styles.clickableElement
            )}
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
                className="body4 textFaded"
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
        </div>
    );
}

export default TransactionListElement;
