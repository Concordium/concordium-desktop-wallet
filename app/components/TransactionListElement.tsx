import React from 'react';
import { Grid } from 'semantic-ui-react';
import { fromMicroUnits, parseTime } from '../utils/transactionHelpers';
import { TransferTransaction } from '../utils/types';
import SidedText from './SidedText';

function getName(transaction) {
    switch (transaction.originType) {
        case 'self':
            return 'toAddressName' in transaction
                ? transaction.toAddressName
                : transaction.toAddress.slice(0, 6);
        case 'account':
            return 'fromAddressName' in transaction
                ? transaction.fromAddressName
                : transaction.fromAddress.slice(0, 6);
        default:
            return 'unknown';
    }
}

function buildOutgoingAmountStrings(total, subtotal, fee) {
    return {
        amount: `${fromMicroUnits(total)}`,
        amountFormula: `${fromMicroUnits(-subtotal)} +${fromMicroUnits(
            fee
        )} Fee`,
    };
}

function buildIncomingAmountStrings(total) {
    return {
        amount: `${fromMicroUnits(total)}`,
        amountFormula: '',
    };
}

function parseAmount(transaction) {
    switch (transaction.originType) {
        case 'self': {
            if (transaction.transactionKind === 'encryptedAmountTransfer') {
                if (transaction.decryptedAmount) {
                    return buildOutgoingAmountStrings(
                        transaction.decryptedAmount,
                        transaction.decryptedAmount - transaction.cost,
                        transaction.cost
                    );
                }
                return {
                    amount: '\u01E4 ?',
                    amountFormula: `\u01E4 ? +${fromMicroUnits(
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
        case 'account':
            if (transaction.transactionKind === 'encryptedAmountTransfer') {
                if (transaction.decryptedAmount) {
                    return buildIncomingAmountStrings(
                        transaction.decryptedAmount
                    );
                }
                return {
                    amount: '\u01E4 ?',
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
        case 'transferWithSchedule':
            return '(schedule)';
        default:
            return '';
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
                left={time}
                right={amountFormula.concat(
                    ` ${
                        transaction.status !== 'finalized' ? ' (Estimated)' : ''
                    }`
                )}
            />
        </Grid>
    );
}

export default TransactionListElement;
