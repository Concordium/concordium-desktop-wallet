import React from 'react';
import { useSelector } from 'react-redux';
import { Grid } from 'semantic-ui-react';
import { parseTime } from '../../utils/timeHelpers';
import { getGTUSymbol, displayAsGTU } from '../../utils/gtu';
import {
    TransferTransaction,
    TransactionStatus,
    OriginType,
    TransactionKindString,
} from '../../utils/types';
import SidedText from '../../components/SidedText';
import { chosenAccountSelector } from '../../features/AccountSlice';

function getName(
    transaction: TransferTransaction,
    isOutgoingTransaction: boolean
) {
    if (isOutgoingTransaction) {
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

function buildOutgoingAmountStrings(
    total: bigint,
    subtotal: bigint,
    fee: bigint
) {
    return {
        amount: `${displayAsGTU(total)}`,
        amountFormula: `${displayAsGTU(-BigInt(subtotal))} +${displayAsGTU(
            fee
        )} Fee`,
    };
}

function buildIncomingAmountStrings(total: bigint) {
    return {
        amount: `${displayAsGTU(total)}`,
        amountFormula: '',
    };
}

function parseAmount(
    transaction: TransferTransaction,
    isOutgoingTransaction: boolean
) {
    switch (transaction.originType) {
        case OriginType.Self:
        case OriginType.Account:
            if (isOutgoingTransaction) {
                const cost = BigInt(transaction.cost || '0');
                if (
                    transaction.transactionKind ===
                    TransactionKindString.EncryptedAmountTransfer
                ) {
                    if (transaction.decryptedAmount) {
                        const total = BigInt(transaction.decryptedAmount);
                        return buildOutgoingAmountStrings(
                            total,
                            total - cost,
                            cost
                        );
                    }
                    return {
                        amount: `${getGTUSymbol()} ?`,
                        amountFormula: `${getGTUSymbol()} ? +${displayAsGTU(
                            cost
                        )} Fee`,
                    };
                }
                return buildOutgoingAmountStrings(
                    BigInt(transaction.total),
                    BigInt(transaction.subtotal),
                    cost
                );
            }
            if (
                transaction.transactionKind ===
                TransactionKindString.EncryptedAmountTransfer
            ) {
                if (transaction.decryptedAmount) {
                    return buildIncomingAmountStrings(
                        BigInt(transaction.decryptedAmount)
                    );
                }
                return {
                    amount: `${getGTUSymbol()} ?`,
                    amountFormula: '',
                };
            }
            return buildIncomingAmountStrings(BigInt(transaction.total));

        default:
            return {
                amount: `${getGTUSymbol()} ?`,
                amountFormula: 'Parsing failed',
            };
    }
}

function displayType(kind: TransactionKindString) {
    switch (kind) {
        case TransactionKindString.TransferWithSchedule:
            return '(schedule)';
        default:
            return '';
    }
}

function statusSymbol(status: TransactionStatus) {
    switch (status) {
        case TransactionStatus.Pending:
            return '';
        case TransactionStatus.Committed:
            return '\u2713';
        case TransactionStatus.Finalized:
            return '\u2713\u2713';
        case TransactionStatus.Rejected:
            return '!';
        default:
            return '?';
    }
}

interface Props {
    transaction: TransferTransaction;
}

/**
 * Displays the given transaction basic information.
 */
function TransactionListElement({ transaction }: Props): JSX.Element {
    const account = useSelector(chosenAccountSelector);
    if (!account) {
        throw new Error('Unexpected missing chosen account');
    }
    const isOutgoingTransaction = transaction.fromAddress === account.address;
    const time = parseTime(transaction.blockTime);
    const name = getName(transaction, isOutgoingTransaction);
    const { amount, amountFormula } = parseAmount(
        transaction,
        isOutgoingTransaction
    );

    return (
        <Grid container columns={2}>
            <SidedText
                left={name.concat(
                    ` ${displayType(transaction.transactionKind)}`
                )}
                right={amount}
            />
            <SidedText
                left={`${time} ${statusSymbol(transaction.status)}`}
                right={amountFormula.concat(
                    ` ${
                        transaction.status !== TransactionStatus.Finalized
                            ? ' (Estimated)'
                            : ''
                    }`
                )}
            />
        </Grid>
    );
}

export default TransactionListElement;
