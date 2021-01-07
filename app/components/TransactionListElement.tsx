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

function parseAmount(transaction) {
    switch (transaction.originType) {
        case 'self': {
            const fee = parseInt(transaction.cost, 10);
            return {
                amount: `${fromMicroUnits(transaction.total)}`,
                amountFormula: `${fromMicroUnits(
                    -transaction.subtotal
                )} +${fromMicroUnits(fee)} Fee`,
            };
        }
        case 'account':
            return {
                amount: `${fromMicroUnits(transaction.total)}`,
                amountFormula: '',
            };
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
