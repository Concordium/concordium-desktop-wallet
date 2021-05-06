import React, { useState, useEffect } from 'react';
import { Account, AccountTransaction, AddedCredential } from '~/utils/types';
import SignTransaction from './SignTransaction';
import { createUpdateCredentialsTransaction } from '~/utils/transactionHelpers';

interface Props {
    account: Account | undefined;
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
    addedCredentials,
    removedCredIds,
    currentCredentialAmount,
    newThreshold,
}: Props): JSX.Element | null {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();

    if (!account) {
        throw new Error('Unexpected missing account');
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
        // TODO: Show as loading;
        return null;
    }

    return <SignTransaction transaction={transaction} account={account} />;
}
