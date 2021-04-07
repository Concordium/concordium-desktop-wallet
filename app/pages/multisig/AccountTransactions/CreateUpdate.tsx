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
    account: Account | undefined;
    primaryCredential: Credential;
    addedCredentials: AddedCredential[];
    removedCredIds: string[];
    currentCredentialAmount: number;
    newThreshold: number;
}

/**
 * Creates the accountCredentialUpdate, and prompts the user to sign it.
 */
export default function CreateUpdate({
    account,
    primaryCredential,
    addedCredentials,
    removedCredIds,
    currentCredentialAmount,
    newThreshold,
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
        currentCredentialAmount,
        removedCredIds,
        newThreshold,
    ]);

    if (!transaction) {
        return null; // TODO: show loading;
    }

    return (
        <SignTransaction
            transaction={transaction}
            account={account}
            primaryCredential={primaryCredential}
        />
    );
}
