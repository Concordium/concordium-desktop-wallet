import React from 'react';
import { Grid } from 'semantic-ui-react';
import { parseTime } from '../utils/timeHelpers';
import { getGTUSymbol, displayAsGTU } from '../utils/gtu';
import {
    TransferTransaction,
    TransactionStatus,
    OriginType,
    TransactionKindString,
} from '../utils/types';
import SidedText from './SidedText';

function getName(transaction) {
    switch (transaction.originType) {
        case OriginType.Self:
            return 'toAddressName' in transaction
                ? transaction.toAddressName
                : transaction.toAddress.slice(0, 6);
        case OriginType.Account:
            return 'fromAddressName' in transaction
                ? transaction.fromAddressName
                : transaction.fromAddress.slice(0, 6);
        default:
            return 'unknown';
    }
}

function buildOutgoingAmountStrings(total, subtotal, fee) {
    return {
        amount: `${displayAsGTU(total)}`,
        amountFormula: `${displayAsGTU(-subtotal)} +${displayAsGTU(fee)} Fee`,
    };
}

function buildIncomingAmountStrings(total) {
    return {
        amount: `${displayAsGTU(total)}`,
        amountFormula: '',
    };
}

function parseAmount(transaction) {
    switch (transaction.originType) {
        case OriginType.Self: {
            if (
                transaction.transactionKind ===
                TransactionKindString.EncryptedAmountTransfer
            ) {
                if (transaction.decryptedAmount) {
                    return buildOutgoingAmountStrings(
                        transaction.decryptedAmount,
                        transaction.decryptedAmount - transaction.cost,
                        transaction.cost
                    );
                }
                return {
                    amount: `${getGTUSymbol()} ?`,
                    amountFormula: `${getGTUSymbol()} ? +${displayAsGTU(
                        transaction.cost
                    )} Fee`,
                };
            }
            return buildOutgoingAmountStrings(
                transaction.total,
                transaction.subtotal,
                transaction.cost
            );
        }
        case OriginType.Account:
            if (
                transaction.transactionKind ===
                TransactionKindString.EncryptedAmountTransfer
            ) {
                if (transaction.decryptedAmount) {
                    return buildIncomingAmountStrings(
                        transaction.decryptedAmount
                    );
                }
                return {
                    amount: `${getGTUSymbol()} ?`,
                    amountFormula: '',
                };
            }
            return buildIncomingAmountStrings(transaction.total);
        default:
            return 'unknown';
    }
}

function displayType(kind) {
    switch (kind) {
        case TransactionKindString.TransferWithSchedule:
            return '(schedule)';
        default:
            return '';
    }
}

function statusSymbol(status) {
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
function TransactionListElement({ transaction }: Props): JSX.element {
    const time = parseTime(transaction.blockTime);
    const name = getName(transaction);
    const { amount, amountFormula } = parseAmount(transaction);

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
