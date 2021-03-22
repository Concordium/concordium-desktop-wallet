import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toMicroUnits } from '~/utils/gtu';
import { createSimpleTransferTransaction } from '~/utils/transactionHelpers';
import { Account, AddressBookEntry, AccountTransaction } from '~/utils/types';
import { credentialsSelector } from '~/features/CredentialSlice';
import SignTransaction from './SignTransaction';

interface Props {
    account: Account;
    recipient: AddressBookEntry;
    amount: string;
    setReady: (ready: boolean) => void;
    setProposalId: (id: number) => void;
}

export default function CreateTransaction({
    account,
    recipient,
    amount,
    setProposalId,
    setReady,
}: Props) {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();
    const credentials = useSelector(credentialsSelector);

    useEffect(() => {
        createSimpleTransferTransaction(
            account.address,
            toMicroUnits(amount),
            recipient.address
        )
            .then(setTransaction)
            .catch(() => {});
    }, [setTransaction, account, amount, recipient]);

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
            setReady={setReady}
            account={account}
            primaryCredential={credential}
            setProposalId={setProposalId}
        />
    );
}
