import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AccountTransaction, TransactionKind } from '../utils/types';
import { identitiesSelector } from '../features/IdentitySlice';
import { sendTransaction, getNextAccountNonce } from '../utils/client';
import {
    serializeTransaction,
    getTransactionHash,
} from '../utils/transactionSerialization';
import LedgerComponent from './LedgerComponent';

import locations from '../constants/transferLocations.json';

function getIdentityId(identities, identityName) {
    return identities.filter((identity) => identity.name === identityName)[0]
        .id; // TODO: Can we assume names are unique?
}

async function ledgerSignTransfer(
    transaction,
    accountNumber,
    identityId,
    ledger,
    setSerializedTransaction,
    setTransactionHash
) {
    const path = [0, 0, identityId, 2, accountNumber, 0];
    const signature = await ledger.signTransfer(transaction, path);
    setSerializedTransaction(
        serializeTransaction(transaction, () => [signature])
    );
    setTransactionHash(
        getTransactionHash(transaction, () => [signature]).toString('hex')
    );
    return signature;
}

function toMicroUnits(amount) {
    return Math.floor(amount * 1000000);
}

async function createTransaction(fromAddress, amount, recipient) {
    const nonceJSON = await getNextAccountNonce(fromAddress);
    const { nonce } = JSON.parse(nonceJSON.getValue());
    const transferTransaction: AccountTransaction = {
        sender: fromAddress,
        nonce,
        energyAmount: 200, // TODO: Does this need to be set by the user?
        expiry: 16446744073, // TODO: Don't hardcode?
        transactionKind: TransactionKind.Simple_transfer,
        payload: {
            toAddress: recipient.address,
            amount: toMicroUnits(amount),
        },
    };
    return transferTransaction;
}

function ConfirmTransferComponent({
    account,
    amount,
    recipient,
    setLocation,
    transaction,
    setTransaction,
    setTransactionHash,
}): JSX.element {
    const [serializedTransaction, setSerializedTransaction] = useState(
        undefined
    );
    const identities = useSelector(identitiesSelector);

    const estimatedFee = 1; // TODO calculate

    useEffect(() => {
        createTransaction(account.address, amount, recipient)
            .then((transferTransaction) => setTransaction(transferTransaction))
            .catch((e) =>
                console.log(`unable to create transaction due to : ${e.stack} `)
            );
    }, [setTransaction, account, amount, recipient]);

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
                        Amount: \u01E4 ${amount}
                        Estimated fee: \u01E4 ${estimatedFee}
                        To: ${recipient.name} (${recipient.address})
                    `}
                </pre>

                <LedgerComponent
                    ledgerCall={(ledger) =>
                        ledgerSignTransfer(
                            transaction,
                            account.accountNumber,
                            getIdentityId(identities, account.identityName),
                            ledger,
                            setSerializedTransaction,
                            setTransactionHash
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
    account: PropTypes.object.isRequired,
    amount: PropTypes.string.isRequired,
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
    setTransactionHash: PropTypes.func.isRequired,
};

ConfirmTransferComponent.defaultProps = {
    transaction: undefined,
};

export default ConfirmTransferComponent;
