import React from 'react';
import styles from './Transaction.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { Transaction } from '../utils/types';

function getName(transaction) {
    switch (transaction.originType) {
        case 'self':
            return 'toAddressName' in transaction
                ? transaction.toAddressName
                : transaction.toAddress;
        case 'account':
            return 'fromAddressName' in transaction
                ? transaction.fromAddressName
                : transaction.fromAddress;
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
                    amount: 'G ?',
                    amountFormula: `G ? +${fromMicroUnits(
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
                    amount: 'G ?',
                    amountFormula: '',
                };
            }
            return buildIncomingAmountStrings(transaction.total);
        default:
            return 'unknown';
    }
}

function parseTime(epoch) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
    });
    return dtFormat.format(new Date(epoch * 1e3));
}

interface Props {
    transaction: Transaction;
    onClick?: () => void;
}

function TransactionListElement({ transaction, onClick }: Props): JSX.element {
    const time = parseTime(transaction.blockTime);
    const name = getName(transaction);
    const { amount, amountFormula } = parseAmount(transaction);

    return (
        <div className={styles.transactionListElement} onClick={onClick}>
            <pre className={styles.leftAligned}>
                {name} {' \n'}
                {time}
            </pre>
            <pre className={styles.rightAligned}>
                {amount} {' \n'}
                {amountFormula}
            </pre>
        </div>
    );
}

TransactionListElement.defaultProps = {
    onClick: () => {},
};

export default TransactionListElement;
