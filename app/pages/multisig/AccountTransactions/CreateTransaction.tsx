import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toMicroUnits } from '~/utils/gtu';
import { findAccountTransactionHandler } from '~/utils/updates/HandlerFinder';
import {
    Account,
    AddressBookEntry,
    AccountTransaction,
    Schedule,
    TransactionKindId,
} from '~/utils/types';
import { credentialsSelector } from '~/features/CredentialSlice';
import SignTransaction from './SignTransaction';

interface Props {
    transactionKind: TransactionKindId;
    account: Account;
    recipient: AddressBookEntry;
    amount: string;
    schedule?: Schedule;
}

export default function CreateTransaction({
    transactionKind,
    account,
    recipient,
    amount,
    schedule,
}: Props) {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();
    const credentials = useSelector(credentialsSelector);

    useEffect(() => {
        const handler = findAccountTransactionHandler(transactionKind);
        handler
            .createTransaction({
                sender: account.address,
                amount: toMicroUnits(amount),
                recipient: recipient.address,
                schedule,
            })
            .then(setTransaction)
            .catch(() => {});
    }, [setTransaction, account, amount, recipient, schedule, transactionKind]);

    const credential = useMemo(
        () =>
            credentials.find((cred) => cred.accountAddress === account.address),
        [credentials, account]
    );

    if (!credential) {
        throw new Error('Unexpected missing credential');
    }

    if (!transaction) {
        return null; // TODO: show loading;
    }

    return (
        <SignTransaction
            transaction={transaction}
            account={account}
            primaryCredential={credential}
        />
    );
}
