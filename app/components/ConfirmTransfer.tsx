import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import { AccountTransaction, TransactionKind } from '../utils/types';
import { sendTransaction } from '../utils/client';
import { serializeTransaction } from '../utils/transactionSerialization';
import locations from '../constants/transferLocations.json';

async function ledgerSignTransfer(transaction) {
    const transport = await TransportNodeHid.open('');
    const ledger = new ConcordiumLedgerClient(transport);

    const path = [0, 0, 0, 2, 0, 0];
    const signature = await ledger.signTransfer(transaction, path);
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
    setTransaction,
}): JSX.element {
    const [statusMessage, setStatusMessage] = useState(
        'please confirm transaction'
    );
    const [serializedTransaction, setSerializedTransaction] = useState(
        undefined
    );
    const estimatedFee = 1; // TODO calculate

    useEffect(() => {
        const transaction: AccountTransaction = {
            sender: fromAddress,
            nonce: 1,
            energyAmount: 1,
            expiry: 1,
            transactionKind: TransactionKind.Simple_transfer,
            payload: {
                toAddress: recipient.address,
                amount: toMicro(amount),
            },
        };
        setTransaction(transaction);
        ledgerSignTransfer(transaction).then((signature) => {
            setSerializedTransaction(
                serializeTransaction(transaction, () => [signature])
            );
            setStatusMessage('Transfer has been signed');
            return true;
        });
    }, [setTransaction, setSerializedTransaction, setStatusMessage, fromAddress, amount, recipient]);

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
            <button onClick={() => setLocation(locations.pickAmount)}>
                {'<--'}
            </button>
            <div>
                <pre>
                    {`
                        Amount: G ${amount}
                        Estimated fee: G ${estimatedFee}
                        To: ${recipient.name} (${recipient.address})
                        ${statusMessage}
            `}
                </pre>
            </div>
            <button onClick={submit} disabled={!serializedTransaction}>
                Submit
            </button>
        </div>
    );
}

ConfirmTransferComponent.propTypes = {
    fromAddress: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    recipient: PropTypes.object.isRequired,
    setLocation: PropTypes.func.isRequired,
    setTransaction: PropTypes.func.isRequired,
};

export default ConfirmTransferComponent;
