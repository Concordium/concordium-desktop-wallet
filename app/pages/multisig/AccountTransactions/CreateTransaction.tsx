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

interface Props {
    transactionKind: TransactionKindId;
    account: Account;
    recipient: AddressBookEntry;
    estimatedFee?: Fraction;
    amount: string;
    schedule?: Schedule;
    expiryTime: Date;
}

export default function CreateTransaction({
    transactionKind,
    account,
    recipient,
    amount,
    schedule,
    estimatedFee,
    expiryTime,
}: Props) {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();

    useEffect(() => {
        const handler = findAccountTransactionHandler(transactionKind);
        handler
            .createTransaction({
                sender: account.address,
                amount: toMicroUnits(amount),
                recipient: recipient.address,
                signatureAmount: account.signatureThreshold,
                expiryTime,
                schedule,
            })
            .then((t) => setTransaction({ ...t, estimatedFee }))
            .catch(() => {}); // The failure happens if we are unable to get the nonce. // TODO This should be refactored to not happen here.
    }, [
        setTransaction,
        account,
        amount,
        recipient,
        schedule,
        transactionKind,
        estimatedFee,
        expiryTime,
    ]);

    if (!transaction) {
        return null; // TODO: show loading;
    }

    return <SignTransaction transaction={transaction} account={account} />;
}
