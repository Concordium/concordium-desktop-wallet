import PropTypes from 'prop-types';
import React from 'react';
import styles from './Transaction.css';

function fromMicroUnits(amount) {
    return `${Math.floor(amount / 1000000)}.${amount % 1000000}`;
}

function attemptAlias(address, addressBook): string {
    const filtered = addressBook.filter((x) => x.address === address);
    if (filtered.length === 0) {
        return address;
    }
    return filtered[0].name;
}

function getAddress(transaction) {
    switch (transaction.origin.type) {
        case 'self':
            return transaction.details.transferDestination;
        case 'account':
            return transaction.origin.address;
        default:
            return 'unknown';
    }
}

function getAmount(transaction) {
    switch (transaction.details.type) {
        case 'transfer':
            return transaction.details.transferAmount;
        case 'encryptedAmountTransfer':
            return transaction.details.transferAmount;
        default:
            return 'unknown';
    }
}

function parseAmount(transaction) {
    const transferAmount = getAmount(transaction);

    switch (transaction.origin.type) {
        case 'self': {
            const fee = parseInt(transaction.cost, 10);
            return {
                amount: `- G ${fromMicroUnits(
                    parseInt(transferAmount, 10) + fee
                )}`,
                amountFormula: `G${fromMicroUnits(
                    transferAmount
                )} + G${fromMicroUnits(fee)} Fee`,
            };
        }
        case 'account':
            return {
                amount: `+ G ${fromMicroUnits(transferAmount)}`,
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

function TransactionListElement({ transaction, addressBook }): JSX.element {
    const time = parseTime(transaction.blockTime);
    const address = attemptAlias(getAddress(transaction), addressBook);
    const { amount, amountFormula } = parseAmount(transaction);

    return (
        <div className={styles.transactionListElement}>
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

TransactionListElement.propTypes = {
    transaction: PropTypes.object.isRequired,
    addressBook: PropTypes.array.isRequired,
};

export default TransactionListElement;
