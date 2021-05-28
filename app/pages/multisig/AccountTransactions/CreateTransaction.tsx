import React, { useState, useEffect } from 'react';
import { toMicroUnits } from '~/utils/gtu';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import {
    Account,
    AddressBookEntry,
    AccountTransaction,
    Schedule,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import SignTransaction from './SignTransaction';
import { ensureNonce } from '~/components/Transfers/withNonce';
import LoadingComponent from './LoadingComponent';

interface Props {
    transactionKind: TransactionKindId;
    account: Account;
    recipient: AddressBookEntry;
    estimatedFee?: Fraction;
    amount: string;
    schedule?: Schedule;
    nonce: string;
}

function CreateTransaction({
    transactionKind,
    account,
    recipient,
    amount,
    schedule,
    estimatedFee,
    nonce,
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
    ]);

    if (!transaction) {
        return null; // TODO: show loading;
    }

    return <SignTransaction transaction={transaction} account={account} />;
}

export default ensureNonce(CreateTransaction, LoadingComponent);
