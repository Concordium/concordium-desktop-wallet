import { Dispatch, AnyAction } from 'redux';
import { updateEntry } from '../database/MultiSignatureProposalDao';
import { loadProposals } from '../features/MultiSignatureSlice';
import { getTransactionStatus } from './client';
import { hashSha256 } from './serializationHelpers';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TransactionStatus,
} from './types';
import { serializeUpdateInstruction } from './UpdateSerialization';

// Poll every 15 seconds.
const pollingIntervalMs = 15000;

/**
 * Queries the node for the status of the transaction with the provided transaction hash.
 * The polling will continue until the transaction becomes absent or finalized.
 * @param transactionHash the hash of the transaction to get the status for
 */
async function getStatus(transactionHash: string): Promise<TransactionStatus> {
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            const response = (
                await getTransactionStatus(transactionHash)
            ).getValue();
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
export default async function getMultiSignatureTransactionStatus(
    proposal: MultiSignatureTransaction,
    dispatch: Dispatch<AnyAction>
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
