import React, { useEffect } from 'react';
import { sendTransaction, getTransactionStatus } from '../../utils/client';
import {
    serializeTransaction,
    getTransactionHash,
} from '../../utils/transactionSerialization';
import LedgerComponent from '../LedgerComponent';
import { createSimpleTransferTransaction } from '../../utils/transactionHelpers';
import {
    Account,
    AccountTransaction,
    AddressBookEntry,
} from '../../utils/types';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import locations from '../../constants/transferLocations.json';

export interface Props {
    account: Account;
    amount: string;
    recipient: AddressBookEntry;
    transaction: AccountTransaction;
    setLocation(location: string): void;
    setTransaction(transaction: AccountTransaction): void;
}

async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function confirmTransaction(transactionId: string) {
    while (true) {
        const response = await getTransactionStatus(transactionId);
        const data = response.getValue();
        console.log(data);
        if (data === 'null') {
            // TODO: Transaction was rejected / is absent
            break;
        } else {
            const dataObject = JSON.parse(data);
            const { status } = dataObject;
            if (status === 'finalized') {
                // TODO: Transaction is on the chain
                break;
            }
        }
        await sleep(10000);
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
            .catch((e) =>
                console.log(`unable to create transaction due to : ${e.stack} `)
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
            confirmTransaction(transactionHash);
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
