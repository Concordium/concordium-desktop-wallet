import { parse } from './JSONHelper';
import { getAll, updateEntry } from '~/database/MultiSignatureProposalDao';
import { loadProposals } from '~/features/MultiSignatureSlice';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TransactionStatus,
    Dispatch,
    instanceOfAccountTransaction,
    instanceOfUpdateAccountCredentials,
    UpdateAccountCredentials,
    Transaction,
} from './types';
import {
    confirmTransaction,
    rejectTransaction,
} from '~/features/TransactionSlice';
import { getPendingTransactions } from '~/database/TransactionDao';
import { getStatus, isSuccessfulTransaction } from './transactionHelpers';
import { getTransactionSubmissionId } from './transactionHash';
import { updateSignatureThreshold } from '~/features/AccountSlice';
import { updateCredentialIndex } from '~/features/CredentialSlice';

/**
 * Given an UpdateAccountCredentials transaction, update the local credentialIndices
 * according to the transaction, and update the signatureThreshold of the account.
 * For each added credential, update its index. For each removed credential,
 * remove its index to indicate that it has been removed.
 */
export function updateAccountCredentialsPerformConsequence(
    dispatch: Dispatch,
    transaction: UpdateAccountCredentials
) {
    transaction.payload.addedCredentials.forEach(({ index, value }) =>
        updateCredentialIndex(dispatch, value.credId, index)
    );
    transaction.payload.removedCredIds.forEach((credId) =>
        updateCredentialIndex(dispatch, credId, undefined)
    );
    updateSignatureThreshold(
        dispatch,
        transaction.sender,
        transaction.payload.threshold
    );
}

/**
 * Poll for the transaction status of the provided multi signature transaction proposal, and
 * update the status of the proposal in the database and state accordingly.
 * @param proposal the transaction proposal to listen for the status of
 * @param dispatch
 */
export async function getMultiSignatureTransactionStatus(
    proposal: MultiSignatureTransaction,
    dispatch: Dispatch
) {
    const transaction: Transaction = parse(proposal.transaction);

    const transactionHash = getTransactionSubmissionId(transaction);

    const response = await getStatus(transactionHash);

    const updatedProposal = {
        ...proposal,
    };

    switch (response.status) {
        case TransactionStatus.Rejected:
            updatedProposal.status = MultiSignatureTransactionStatus.Rejected;
            break;
        case TransactionStatus.Finalized:
            if (isSuccessfulTransaction(Object.values(response.outcomes))) {
                if (
                    instanceOfAccountTransaction(transaction) &&
                    instanceOfUpdateAccountCredentials(transaction)
                ) {
                    updateAccountCredentialsPerformConsequence(
                        dispatch,
                        transaction
                    );
                }
                updatedProposal.status =
                    MultiSignatureTransactionStatus.Finalized;
            } else {
                updatedProposal.status = MultiSignatureTransactionStatus.Failed;
            }
            break;
        default:
            throw new Error('Unexpected status was returned by the poller!');
    }

    // Update the proposal and reload state from the database.
    await updateEntry(updatedProposal);
    loadProposals(dispatch);
}

/**
 * Wait for the transaction to be finalized (or rejected) and update accordingly
 */
export async function monitorTransactionStatus(transactionHash: string) {
    const response = await getStatus(transactionHash);
    switch (response.status) {
        case TransactionStatus.Rejected:
            rejectTransaction(transactionHash);
            break;
        case TransactionStatus.Finalized: {
            confirmTransaction(transactionHash, response.outcomes);
            break;
        }
        default:
            throw new Error('Unexpected status was returned by the poller!');
    }
}

/**
 * Load all submitted proposals and sent transfers from the database, and
 * start listening for their status towards the node.
 */
export default async function listenForTransactionStatus(dispatch: Dispatch) {
    const transfers = await getPendingTransactions();
    transfers.forEach((transfer) =>
        monitorTransactionStatus(transfer.transactionHash)
    );

    const allProposals = await getAll();
    allProposals
        .filter(
            (proposal) =>
                proposal.status === MultiSignatureTransactionStatus.Submitted
        )
        .forEach((proposal) => {
            getMultiSignatureTransactionStatus(proposal, dispatch);
        });
}
