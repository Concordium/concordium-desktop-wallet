import PropTypes from 'prop-types';
import React from 'react';

function fromMicroUnits(amount) {
    return `${Math.floor(amount / 1000000)}.${amount % 1000000}`;
}

function TransactionListElement({ transaction }): JSX.element {
    // TODO: lookup transferDestination in addressBook
    try {
        if (transaction.origin.type === 'self') {
            return (
                <div>
                    Sent {fromMicroUnits(transaction.details.transferAmount)} to{' '}
                    {transaction.details.transferDestination} with a cost of{' '}
                    {fromMicroUnits(transaction.cost)}.
                </div>
            );
        }
        if (transaction.origin.type === 'account') {
            return (
                <div>
                    Received{' '}
                    {fromMicroUnits(transaction.details.transferAmount)} from{' '}
                    {transaction.origin.address}.
                </div>
            );
        }
        return <div>Unknown TransactionType</div>;
    } catch (e) {
        return <div> Failed displaying transaction due to {e} </div>;
    }
}

TransactionListElement.propTypes = {
    transaction: PropTypes.object.isRequired,
};

export default TransactionListElement;
