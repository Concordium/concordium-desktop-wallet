import { getPendingTransactions } from '../database/TransactionDao';
import { getAll, updateEntry } from '../database/MultiSignatureProposalDao';
import { loadProposals } from '../features/MultiSignatureSlice';
import { getTransactionStatus } from './client';
import { hashSha256 } from './serializationHelpers';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TransactionStatus,
    Dispatch,
} from './types';
import { serializeUpdateInstruction } from './UpdateSerialization';
import { waitForFinalization } from './transactionHelpers';
import {
    confirmTransaction,
    rejectTransaction,
} from '../features/TransactionSlice';

// Poll every 20 seconds
const pollingIntervalMs = 20000;

/**
 * Queries the node for the status of the transaction with the provided transaction hash.
 * The polling will continue until the transaction becomes absent or finalized.
 * @param transactionHash the hash of the transaction to get the status for
 */
async function getStatus(transactionHash: string): Promise<TransactionStatus> {
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            let response;
            try {
                response = (
                    await getTransactionStatus(transactionHash)
                ).getValue();
            } catch (err) {
                // This happens if the node cannot be reached. Just wait for the next
                // interval and try again.
                return;
            }
            if (response === 'null') {
                clearInterval(interval);
                resolve(TransactionStatus.Rejected);
                return;
            }

            const { status } = JSON.parse(response);
            if (status === 'finalized') {
                clearInterval(interval);
                resolve(TransactionStatus.Finalized);
            }
        }, pollingIntervalMs);
    });
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
    const updateInstruction = JSON.parse(proposal.transaction);
    const serializedUpdateInstruction = serializeUpdateInstruction(
        updateInstruction
    );
    const transactionHash = hashSha256(serializedUpdateInstruction).toString(
        'hex'
    );
    const status = await getStatus(transactionHash);

    const updatedProposal = {
        ...proposal,
    };

    switch (status) {
        case TransactionStatus.Rejected:
            updatedProposal.status = MultiSignatureTransactionStatus.Failed;
            break;
        case TransactionStatus.Finalized:
            updatedProposal.status = MultiSignatureTransactionStatus.Finalized;
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
    const dataObject = await waitForFinalization(transactionHash);
    if (dataObject) {
        confirmTransaction(transactionHash, dataObject);
    } else {
        rejectTransaction(transactionHash);
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
