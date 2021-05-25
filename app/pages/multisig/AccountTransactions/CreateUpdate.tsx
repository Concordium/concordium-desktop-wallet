import React, { useState, useEffect } from 'react';
import { Account, AccountTransaction, AddedCredential } from '~/utils/types';
import SignTransaction from './SignTransaction';
import { createUpdateCredentialsTransaction } from '~/utils/transactionHelpers';
import { ensureNonce } from '~/components/Transfers/withNonce';
import LoadingComponent from './LoadingComponent';

interface Props {
    account: Account;
    addedCredentials: AddedCredential[];
    removedCredIds: string[];
    currentCredentialAmount: number;
    newThreshold: number;
    nonce: string;
}

/**
 * Creates the accountCredentialUpdate, and prompts the user to sign it.
 */
function CreateUpdate({ 
   account,
    addedCredentials,
    removedCredIds,
    currentCredentialAmount,
    newThreshold,
    nonce
}: Props): JSX.Element | null {
    const [transaction, setTransaction] = useState<
        AccountTransaction | undefined
    >();

    useEffect(() => {
        setTransaction(createUpdateCredentialsTransaction(
            account.address,
            addedCredentials,
            removedCredIds,
            newThreshold,
            currentCredentialAmount,
            nonce,
            account.signatureThreshold
        ));
    }, [
        setTransaction,
        account,
        addedCredentials,
        currentCredentialAmount,
        removedCredIds,
        nonce,
        newThreshold,
    ]);

    if (!transaction) {
        // TODO: Show as loading;
        return null;
    }

    return <SignTransaction transaction={transaction} account={account} />;
}

export default ensureNonce(CreateUpdate, LoadingComponent);
