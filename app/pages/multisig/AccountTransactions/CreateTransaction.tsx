import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { credentialsSelector } from '~/features/CredentialSlice';
import SignTransaction from './SignTransaction';

interface Props {
    transactionKind: TransactionKindId;
    account: Account;
    recipient: AddressBookEntry;
    estimatedFee?: Fraction;
    amount: string;
    schedule?: Schedule;
}

export default function CreateTransaction({
    transactionKind,
    account,
    recipient,
    amount,
    schedule,
    estimatedFee,
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
                signatureAmount: account.signatureThreshold,
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
    ]);

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
