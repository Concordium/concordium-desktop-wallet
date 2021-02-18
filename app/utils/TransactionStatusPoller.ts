import { getAll, updateEntry } from '../database/MultiSignatureProposalDao';
import { loadProposals } from '../features/MultiSignatureSlice';
import { hashSha256 } from './serializationHelpers';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TransactionStatus,
    Dispatch,
} from './types';
import { serializeUpdateInstruction } from './UpdateSerialization';
import {
    confirmTransaction,
    rejectTransaction,
} from '../features/TransactionSlice';
import { getPendingTransactions } from '../database/TransactionDao';
import { getStatus, getDataObject } from './transactionHelpers';
import findHandler from './updates/HandlerFinder';
import { parse } from './JsonBuffer';

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
    const updateInstruction = parse(proposal.transaction);
    const handler = findHandler(updateInstruction);

    const serializedUpdateInstruction = serializeUpdateInstruction(
        updateInstruction,
        handler.serializePayload()
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
    const status = await getStatus(transactionHash);
    switch (status) {
        case TransactionStatus.Rejected:
            rejectTransaction(transactionHash);
            break;
        case TransactionStatus.Finalized: {
            const dataObject = await getDataObject(transactionHash);
            confirmTransaction(transactionHash, dataObject);
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
