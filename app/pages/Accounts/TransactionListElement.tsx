import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import DoubleCheckmarkIcon from '@resources/svg/double-grey-checkmark.svg';
import CheckmarkIcon from '@resources/svg/grey-checkmark.svg';
import Warning from '@resources/svg/warning.svg';
import { parseTime } from '~/utils/timeHelpers';
import { getGTUSymbol, displayAsGTU } from '~/utils/gtu';
import {
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
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
import styles from './Transactions.module.scss';
import transactionKindNames from '~/constants/transactionKindNames.json';

const isInternalTransfer = (transaction: TransferTransaction) =>
    [
        TransactionKindString.TransferToEncrypted,
        TransactionKindString.TransferToPublic,
    ].includes(transaction.transactionKind);

const isGreen = (
    transaction: TransferTransaction,
    viewingShielded: boolean,
    isOutgoing: boolean
) => {
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

function getName(transaction: TransferTransaction, isOutgoing: boolean) {
    if (isInternalTransfer(transaction)) {
        return '';
    }
    if (isOutgoing) {
        // Current Account is the sender
        if (transaction.toAddressName !== undefined) {
            return transaction.toAddressName;
        }
        return transaction.toAddress.slice(0, 6);
    }
    if (transaction.fromAddressName !== undefined) {
        return transaction.fromAddressName;
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
    const negative = isOutgoing ? '-' : '';
    return {
        amount: `${negative} ${getGTUSymbol()} ?`,
        amountFormula: '',
    };
}

function parseAmount(transaction: TransferTransaction, isOutgoing: boolean) {
    if (isTransferKind(transaction.transactionKind)) {
        if (isOutgoing) {
            const cost = BigInt(transaction.cost || '0');
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

interface Props {
    transaction: TransferTransaction;
    onClick?: () => void;
}

/**
 * Displays the given transaction basic information.
 */
function TransactionListElement({ transaction, onClick }: Props): JSX.Element {
    const account = useSelector(chosenAccountSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);
    if (!account) {
        throw new Error('Unexpected missing chosen account');
    }
    const isOutgoing = isOutgoingTransaction(transaction, account.address);
    const time = parseTime(transaction.blockTime);
    const name = getName(transaction, isOutgoing);
    const amountParser = viewingShielded ? parseShieldedAmount : parseAmount;
    const { amount, amountFormula } = amountParser(transaction, isOutgoing);

    const failed = isFailed(transaction);

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
                              ` ${
                                  transaction.status !==
                                  TransactionStatus.Finalized
                                      ? ' (Estimated)'
                                      : ''
                              }`
                          )
                        : ''
                }
            />
        </div>
    );
}

export default TransactionListElement;
