import React from 'react';
import { Grid, Icon } from 'semantic-ui-react';
import { parseTime } from '../../utils/timeHelpers';
import { getGTUSymbol, displayAsGTU } from '../../utils/gtu';
import {
    TransferTransaction,
    TransactionStatus,
    OriginType,
    TransactionKindString,
} from '../../utils/types';
import SidedRow from '../../components/SidedRow';
import { isFailed } from '../../utils/transactionHelpers';

function getName(transaction: TransferTransaction) {
    switch (transaction.originType) {
        case OriginType.Self:
            if (transaction.toAddressName !== undefined) {
                return transaction.toAddressName;
            }
            return transaction.toAddress.slice(0, 6);

        case OriginType.Account:
            if (transaction.fromAddressName !== undefined) {
                return transaction.fromAddressName;
            }
            return transaction.fromAddress.slice(0, 6);

        default:
            return 'unknown';
    }
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

function parseAmount(transaction: TransferTransaction) {
    switch (transaction.originType) {
        case OriginType.Self: {
            const cost = BigInt(transaction.cost);
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
        case OriginType.Account:
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
            return ' (schedule)';
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
    const time = parseTime(transaction.blockTime);
    const name = getName(transaction);
    const { amount, amountFormula } = parseAmount(transaction);

    return (
        <Grid container columns={2}>
            <SidedRow
                left={
                    <>
                        {isFailed(transaction) ? (
                            <Icon name="warning circle" color="red" />
                        ) : null}
                        {name.concat(displayType(transaction.transactionKind))}
                    </>
                }
                right={amount}
            />
            <SidedRow
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
