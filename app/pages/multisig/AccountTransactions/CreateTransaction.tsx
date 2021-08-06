import React, { useState, useEffect } from 'react';
import { AccountTransactionType } from '@concordium/node-sdk';
import { toMicroUnits } from '~/utils/gtu';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import {
    Account,
    AddressBookEntry,
    AccountTransaction,
    Schedule,
    Fraction,
} from '~/utils/types';
import { ensureNonce } from '~/components/Transfers/withNonce';
import Loading from '~/cross-app-components/Loading';
import SignTransaction from './SignTransaction';

interface Props {
    transactionKind: AccountTransactionType;
    account: Account;
    recipient: AddressBookEntry;
    estimatedFee?: Fraction;
    amount: string;
    schedule?: Schedule;
    nonce: string;
    expiryTime: Date;
}

function CreateTransaction({
    transactionKind,
    account,
    recipient,
    amount,
    schedule,
    estimatedFee,
    nonce,
    expiryTime,
}: Props) {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();

    useEffect(() => {
        const handler = findAccountTransactionHandler(transactionKind);
        const t = handler.createTransaction({
            sender: account.address,
            amount: toMicroUnits(amount),
            recipient: recipient.address,
            signatureAmount: account.signatureThreshold,
            expiryTime,
            schedule,
            nonce,
        });
        setTransaction({ ...t, estimatedFee });
    }, [
        setTransaction,
        account,
        amount,
        recipient,
        schedule,
        transactionKind,
        estimatedFee,
        nonce,
        expiryTime,
    ]);

    if (!transaction) {
        return null; // TODO: show loading;
    }

    return <SignTransaction transaction={transaction} account={account} />;
}

export default ensureNonce(CreateTransaction, () => (
    <Loading text="Fetching information from the node" />
));
