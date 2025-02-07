import { TransactionSummaryType } from '@concordium/web-sdk';
import { parse, stringify } from './JSONHelper';
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
    TransferTransaction,
} from './types';
import {
    confirmTransaction,
    rejectTransaction,
} from '~/features/TransactionSlice';
import { getPendingTransactions } from '~/database/TransactionDao';
import {
    isSuccessfulTransaction,
    isShieldedBalanceTransaction,
} from './transactionHelpers';
import { getStatus } from '~/node/nodeHelpers';
import { getTransactionHash } from './transactionHash';
import {
    updateAccountInfoOfAddress,
    updateSignatureThreshold,
    updateShieldedBalance,
} from '~/features/AccountSlice';
import {
    insertExternalCredentials,
    removeExternalCredentials,
} from '~/features/CredentialSlice';
import { throwLoggedError } from './basicHelpers';

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

    insertExternalCredentials(
        dispatch,
        transaction.sender,
        transaction.payload.addedCredentials
    );
    removeExternalCredentials(dispatch, transaction.payload.removedCredIds);
}

function ShieldedTransferConsequence(
    dispatch: Dispatch,
    transaction: TransferTransaction
) {
    if (!transaction.encrypted) {
        throwLoggedError(
            `Unexpected missing encrypted information. Hash: ${transaction.transactionHash}`
        );
    }
    const { newSelfEncryptedAmount, remainingDecryptedAmount } = parse(
        transaction.encrypted
    );
    return updateShieldedBalance(
        dispatch,
        transaction.fromAddress,
        newSelfEncryptedAmount,
        remainingDecryptedAmount
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

    const transactionHash = await getTransactionHash(transaction);

    const response = await getStatus(transactionHash);

    const updatedProposal = {
        ...proposal,
    };

    switch (response.status) {
        case TransactionStatus.Rejected:
            updatedProposal.status = MultiSignatureTransactionStatus.Rejected;
            break;
        case TransactionStatus.Finalized: {
            const { outcome } = response;
            if (isSuccessfulTransaction(outcome.summary)) {
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
            if (
                outcome.summary.type ===
                TransactionSummaryType.AccountTransaction
            ) {
                updatedProposal.transaction = stringify({
                    ...transaction,
                    cost: outcome.summary.cost,
                });
            }
            break;
        }
        default:
            throwLoggedError(
                `Unexpected status was returned by the poller! Status: ${response}`
            );
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
    transaction: TransferTransaction
) {
    const { transactionHash, fromAddress } = transaction;
    const response = await getStatus(transactionHash);
    switch (response.status) {
        case TransactionStatus.Rejected:
            rejectTransaction(dispatch, transactionHash);
            break;
        case TransactionStatus.Finalized: {
            // A finalized transaction will always result in exactly one outcome,
            // which we can extract directly here.
            const { blockHash } = response.outcome;
            const event = response.outcome.summary;
            if (event.type !== TransactionSummaryType.AccountTransaction) {
                // TODO throw error on this weird case?
                break;
            }
            confirmTransaction(
                dispatch,
                transactionHash,
                blockHash.toString(),
                event
            );
            if (isSuccessfulTransaction(event)) {
                if (isShieldedBalanceTransaction(transaction)) {
                    await ShieldedTransferConsequence(dispatch, transaction);
                }
            }
            break;
        }
        default:
            throwLoggedError(
                `Unexpected status was returned by the poller! Status: ${response}`
            );
    }
    updateAccountInfoOfAddress(fromAddress, dispatch);
}

/**
 * Load all submitted proposals and sent transfers from the database, and
 * start listening for their status towards the node.
 */
export default async function listenForTransactionStatus(dispatch: Dispatch) {
    const transfers = await getPendingTransactions();
    transfers.forEach((transfer) =>
        monitorTransactionStatus(dispatch, transfer)
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
