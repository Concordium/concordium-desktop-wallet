import React from 'react';
import { LocationDescriptorObject } from 'history';
import { AccountTransaction } from '../../utils/types';
import {
    serializeTransaction,
    getTransactionHash,
} from '../../utils/transactionSerialization';
import { sendTransaction } from '../../utils/nodeRequests';
import Button from '../../cross-app-components/Button';
import { addPendingTransaction } from '../../features/TransactionSlice';
import { monitorTransactionStatus } from '../../utils/TransactionStatusPoller';
import { parse } from '../../utils/JSONHelper';

interface State {
    transaction: string;
    signature: string;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

export default function CreateUpdate({ location }: Props): JSX.Element {
    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const {
        signature: signatureHex,
        transaction: transactionJSON,
    } = location.state;
    const transaction: AccountTransaction = parse(transactionJSON);

    async function submitTransaction() {
        const signatureStructured = {
            0: { 0: Buffer.from(signatureHex, 'hex') },
        };
        const serializedTransaction = serializeTransaction(
            transaction,
            () => signatureStructured
        );
        const transactionHash = getTransactionHash(
            transaction,
            () => signatureStructured
        ).toString('hex');
        const response = await sendTransaction(serializedTransaction);
        if (response.getValue()) {
            addPendingTransaction(transaction, transactionHash);
            monitorTransactionStatus(transactionHash);
        } else {
            // TODO: handle rejection from node
        }
    }

    return <Button onClick={submitTransaction}>Submit</Button>;
}
