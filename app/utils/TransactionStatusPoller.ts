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
import {
    updateAccountInfoOfAddress,
    updateSignatureThreshold,
} from '~/features/AccountSlice';

/**
 * Given an UpdateAccountCredentials transaction, update the local state
 * according to the transaction's changes.
 * For each added credential, add it to the local database.
 * For each removed credential, remove its index to indicate that it has been removed.
 * Update the signatureThreshold of the account.
 */
export function updateAccountCredentialsPerformConsequence(
    dispatch: Dispatch,
    transaction: UpdateAccountCredentials
) {
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

    const transactionHash = await getTransactionSubmissionId(transaction);

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
export async function monitorTransactionStatus(
    dispatch: Dispatch,
    transactionHash: string,
    senderAddress: string
) {
    const response = await getStatus(transactionHash);
    switch (response.status) {
        case TransactionStatus.Rejected:
            rejectTransaction(dispatch, transactionHash);
            break;
        case TransactionStatus.Finalized: {
            confirmTransaction(dispatch, transactionHash, response.outcomes);
            break;
        }
        default:
            throw new Error('Unexpected status was returned by the poller!');
    }
    updateAccountInfoOfAddress(senderAddress, dispatch);
}

/**
 * Load all submitted proposals and sent transfers from the database, and
 * start listening for their status towards the node.
 */
export default async function listenForTransactionStatus(dispatch: Dispatch) {
    const transfers = await getPendingTransactions();
    transfers.forEach((transfer) =>
        monitorTransactionStatus(
            dispatch,
            transfer.transactionHash,
            transfer.fromAddress
        )
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
