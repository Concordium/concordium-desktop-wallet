import React from 'react';
import { push } from 'connected-react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
    Account,
    AccountTransaction,
    MultiSignatureTransactionStatus,
    MultiSignatureTransaction,
} from '~/utils/types';
import { stringify } from '~/utils/JSONHelper';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { globalSelector } from '~/features/GlobalSlice';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { insert } from '~/database/MultiSignatureProposalDao';
import { addProposal } from '~/features/MultiSignatureSlice';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';
import SignTransactionColumn from '../SignTransactionProposal/SignTransaction';
import { selectedProposalRoute } from '~/utils/routerHelper';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';

interface Props {
    transaction: AccountTransaction;
    account: Account | undefined;
}

export async function signUsingLedger(
    ledger: ConcordiumLedgerClient,
    transaction: AccountTransaction,
    account: Account
) {
    const signatureIndex = 0;

    const credential = await findLocalDeployedCredentialWithWallet(
        account.address,
        ledger
    );
    if (!credential) {
        throw new Error(
            'Unable to sign the account transaction, as you do not currently have a matching credential deployed on the given account for the connected wallet.'
        );
    }

    const path = {
        identityIndex: credential.identityNumber,
        accountIndex: credential.credentialNumber,
        signatureIndex,
    };

    const handler = findAccountTransactionHandler(transaction.transactionKind);
    const signature = await handler.signTransaction(transaction, ledger, path);

    const multiSignatureTransaction: Partial<MultiSignatureTransaction> = {
        // The JSON serialization of the transaction
        transaction: stringify({
            ...transaction,
            signatures: buildTransactionAccountSignature(
                credential.credentialIndex,
                signatureIndex,
                signature
            ),
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

    return multiSignatureTransaction;
}

interface Props {
    transaction: AccountTransaction;
    account: Account | undefined;
}

/**
 * Prompts the user to sign the account transaction.
 */
export default function SignTransaction({
    transaction,
    account,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);

    async function sign(ledger: ConcordiumLedgerClient) {
        if (!account || !global) {
            throw new Error('Unexpected missing account or global');
        }

        const proposal = await signUsingLedger(ledger, transaction, account);

        if (proposal.id === undefined) {
            throw new Error('unexpected missing proposal id');
        }

        // Set the current proposal in the state to the one that was just generated.
        dispatch(addProposal(proposal));
        dispatch(push(selectedProposalRoute(proposal.id)));
    }

    return <SignTransactionColumn signingFunction={sign} />;
}
