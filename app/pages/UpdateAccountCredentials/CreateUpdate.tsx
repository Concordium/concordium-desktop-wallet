import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Account,
    CredentialDeploymentInformation,
    MultiSignatureTransactionStatus,
    MultiSignatureTransaction,
} from '../../utils/types';
import { stringify } from '../../utils/JSONHelper';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { globalSelector } from '../../features/GlobalSlice';
import { createUpdateCredentialsTransaction } from '../../utils/transactionHelpers';
import { getAccountPath } from '../../features/ledger/Path';
import { insert } from '../../database/MultiSignatureProposalDao';
import { setCurrentProposal } from '../../features/MultiSignatureSlice';

interface Props {
    setReady: (ready: boolean) => void;
    account: Account | undefined;
    addedCredentials: CredentialDeploymentInformation[];
    removedCredIds: string[];
    newThreshold: number;
}

/**
 * Creates the accountCredentialUpdate, and prompts the user to sign it.
 */
export default function CreateUpdate({
    setReady,
    account,
    addedCredentials,
    removedCredIds,
    newThreshold,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);

    async function sign(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!account || !global) {
            throw new Error('unexpected missing global/account');
        }
        const transaction = await createUpdateCredentialsTransaction(
            account.address,
            addedCredentials,
            removedCredIds,
            newThreshold
        );
        const path = getAccountPath({
            identityIndex: account.identityId,
            accountIndex: account.accountNumber,
            signatureIndex: 0,
        });

        const signature = await ledger.signUpdateCredentialTransaction(
            transaction,
            path
        );

        const multiSignatureTransaction: Partial<MultiSignatureTransaction> = {
            // The JSON serialization of the transaction
            transaction: stringify({
                ...transaction,
                signature: { 0: { 0: signature } },
            }),
            // The minimum required signatures for the transaction
            // to be accepted on chain.
            threshold: account.signatureThreshold,
            // The current state of the proposal
            status: MultiSignatureTransactionStatus.Open,
        };

        // Save to database and use the assigned id to update the local object.
        const entryId = (await insert(multiSignatureTransaction))[0];
        multiSignatureTransaction.id = entryId;

        // Set the current proposal in the state to the one that was just generated.
        dispatch(setCurrentProposal(multiSignatureTransaction));

        setMessage('Update generated succesfully!');
        setReady(true);
    }

    return <LedgerComponent ledgerCall={sign} />;
}
