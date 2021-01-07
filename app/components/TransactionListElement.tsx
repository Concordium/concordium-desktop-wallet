import React from 'react';
import styles from './Transaction.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { Transaction } from '../utils/types';

function attemptAlias(address, addressBook): string {
    const filtered = addressBook.filter((x) => x.address === address);
    if (filtered.length === 0) {
        return address;
    }
    return filtered[0].name;
}

function getAddress(transaction) {
    switch (transaction.originType) {
        case 'self':
            return transaction.toAddress;
        case 'account':
            return transaction.fromAddress;
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
    addressBook: AddressBookEntry[];
    onClick?: () => void;
}

function TransactionListElement({
    transaction,
    addressBook,
    onClick,
}: Props): JSX.element {
    const time = parseTime(transaction.blockTime);
    const address = attemptAlias(getAddress(transaction), addressBook);
    const { amount, amountFormula } = parseAmount(transaction);

    return (
        <div className={styles.transactionListElement} onClick={onClick}>
            <pre className={styles.leftAligned}>
                {address} {' \n'}
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
