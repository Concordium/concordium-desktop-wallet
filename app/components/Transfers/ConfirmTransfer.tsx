import React, { useEffect } from 'react';
import { sendTransaction } from '../../utils/client';
import {
    serializeTransaction,
    getTransactionHash,
} from '../../utils/transactionSerialization';
import LedgerComponent from '../LedgerComponent';
import {
    createSimpleTransferTransaction,
    waitForFinalization,
} from '../../utils/transactionHelpers';
import {
    Account,
    AccountTransaction,
    AddressBookEntry,
} from '../../utils/types';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import locations from '../../constants/transferLocations.json';
import {
    addPendingTransaction,
    confirmTransaction,
    rejectTransaction,
} from '../../features/TransactionSlice';

export interface Props {
    account: Account;
    amount: string;
    recipient: AddressBookEntry;
    transaction: AccountTransaction;
    setLocation(location: string): void;
    setTransaction(transaction: AccountTransaction): void;
}

/**
 * Wait for the transaction to be finalized (or rejected) and update accordingly
 */
async function monitorTransaction(transactionHash) {
    const dataObject = await waitForFinalization(transactionHash);
    if (dataObject) {
        confirmTransaction(transactionHash, dataObject);
    } else {
        rejectTransaction(transactionHash);
    }
}

export default function ConfirmTransferComponent({
    account,
    amount,
    recipient,
    setLocation,
    transaction,
    setTransaction,
}: Props): JSX.Element {
    const estimatedFee = 1; // TODO calculate

    useEffect(() => {
        createSimpleTransferTransaction(
            account.address,
            amount,
            recipient.address
        )
            .then((transferTransaction) => setTransaction(transferTransaction))
            .catch(
                (e) =>
                    console.log(
                        `unable to create transaction due to : ${e.stack} `
                    ) // TODO: Handle the case where we fail to create the transaction
            );
    }, [setTransaction, account, amount, recipient]);

    async function ledgerSignTransfer(ledger: ConcordiumLedgerClient) {
        const path = [0, 0, account.identityId, 2, account.accountNumber, 0];
        const signature: Buffer = await ledger.signTransfer(transaction, path);
        const serializedTransaction = serializeTransaction(transaction, () => [
            signature,
        ]);
        const transactionHash = getTransactionHash(transaction, () => [
            signature,
        ]).toString('hex');
        const response = await sendTransaction(serializedTransaction);
        if (response.getValue()) {
            addPendingTransaction(transaction, transactionHash, account);
            monitorTransaction(transactionHash);
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

                <LedgerComponent ledgerCall={ledgerSignTransfer} />
            </div>
        </div>
    );
}
