import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { AccountTransaction, TransactionKind } from '../utils/types';
import { sendTransaction } from '../utils/client';
import { serializeTransaction } from '../utils/transactionSerialization';
import LedgerComponent from './LedgerComponent';

import locations from '../constants/transferLocations.json';

async function ledgerSignTransfer(
    transaction,
    ledger,
    setSerializedTransaction
) {
    const path = [0, 0, 4, 2, 0, 0];
    const signature = await ledger.signTransfer(transaction, path);
    setSerializedTransaction(
        serializeTransaction(transaction, () => [signature])
    );
    return signature;
}

function toMicroUnits(amount) {
    return Math.floor(amount * 1000000);
}

function ConfirmTransferComponent({
    fromAddress,
    amount,
    recipient,
    setLocation,
    transaction,
    setTransaction,
}): JSX.element {
    const [serializedTransaction, setSerializedTransaction] = useState(
        undefined
    );

    const estimatedFee = 1; // TODO calculate

    useEffect(() => {
        const transferTransaction: AccountTransaction = {
            sender: fromAddress,
            nonce: 1,
            energyAmount: 1,
            expiry: 1,
            transactionKind: TransactionKind.Simple_transfer,
            payload: {
                toAddress: recipient.address,
                amount: toMicroUnits(amount),
            },
        };
        setTransaction(transferTransaction);
    }, [setTransaction, fromAddress, amount, recipient]);

    async function submit() {
        const response = await sendTransaction(serializedTransaction);
        if (response.getValue()) {
            setLocation(locations.transferSubmitted);
        } else {
            // TODO: handle rejection from node
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => setLocation(locations.pickAmount)}
            >
                {'<--'}
            </button>
            <div>
                <pre>
                    {`
                        Amount: G ${amount}
                        Estimated fee: G ${estimatedFee}
                        To: ${recipient.name} (${recipient.address})
                    `}
                </pre>

                <LedgerComponent
                    ledgerCall={(ledger) =>
                        ledgerSignTransfer(
                            transaction,
                            ledger,
                            setSerializedTransaction
                        )
                    }
                />
            </div>
            <button
                type="submit"
                onClick={submit}
                disabled={!serializedTransaction}
            >
                Submit
            </button>
        </div>
    );
}

ConfirmTransferComponent.propTypes = {
    fromAddress: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    recipient: PropTypes.shape({
        name: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
    }).isRequired,
    transaction: PropTypes.shape({
        sender: PropTypes.string,
        nonce: PropTypes.number,
        energyAmount: PropTypes.number,
        expiry: PropTypes.number,
        transactionKind: PropTypes.number,
        payload: PropTypes.shape({
            toAddress: PropTypes.string,
            amount: PropTypes.number,
        }),
    }),
    setLocation: PropTypes.func.isRequired,
    setTransaction: PropTypes.func.isRequired,
};

ConfirmTransferComponent.defaultProps = {
    transaction: undefined,
};

export default ConfirmTransferComponent;
