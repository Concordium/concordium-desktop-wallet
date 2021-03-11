import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
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
import routes from '../../constants/routes.json';
import { insert } from '../../database/MultiSignatureProposalDao';
import { setCurrentProposal } from '../../features/MultiSignatureSlice';

interface Props {
    setReady: (ready: boolean) => void;
    account: Account | undefined;
    addedCredentials: CredentialDeploymentInformation[];
    removedCredIds: string[];
    newThreshold: number;
}

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

        console.log(path);
        console.log(ledger);
        const signature = Buffer.alloc(1); // await ledger.signUpdateCredentialTransaction(transaction, path);

        setMessage('Update generated succesfully!');
        setReady(true);

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

        // Navigate to the page that displays the current proposal from the state.
        dispatch(
            push(
                routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_ACCOUNT_TRANSACTION
            )
        );
    }

    return <LedgerComponent ledgerCall={sign} />;
}
