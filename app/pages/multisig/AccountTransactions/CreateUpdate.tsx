import React, { useState, useEffect } from 'react';
import {
    Account,
    AccountTransaction,
    Credential,
    AddedCredential,
} from '~/utils/types';
import SignTransaction from './SignTransaction';
import { createUpdateCredentialsTransaction } from '~/utils/transactionHelpers';

interface Props {
    setReady: (ready: boolean) => void;
    account: Account | undefined;
    primaryCredential: Credential;
    addedCredentials: AddedCredential[];
    removedCredIds: string[];
    currentCredentialAmount: number;
    newThreshold: number;
    setProposalId: (id: number) => void;
}

/**
 * Creates the accountCredentialUpdate, and prompts the user to sign it.
 */
export default function CreateUpdate({
    setReady,
    account,
    primaryCredential,
    addedCredentials,
    removedCredIds,
    currentCredentialAmount,
    newThreshold,
    setProposalId,
}: Props): JSX.Element | null {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();

    if (!account) {
        throw new Error('unexpected missing account');
    }

    useEffect(() => {
        createUpdateCredentialsTransaction(
            account.address,
            addedCredentials,
            removedCredIds,
            newThreshold,
            currentCredentialAmount,
            account.signatureThreshold
        )
            .then(setTransaction)
            .catch(() => {});
    }, [
        setTransaction,
        account,
        addedCredentials,
        removedCredIds,
        newThreshold,
    ]);

    if (!transaction) {
        return null; // TODO: show loading;
    }

    return (
        <SignTransaction
            transaction={transaction}
            setReady={setReady}
            account={account}
            primaryCredential={primaryCredential}
            setProposalId={setProposalId}
        />
    );
}
