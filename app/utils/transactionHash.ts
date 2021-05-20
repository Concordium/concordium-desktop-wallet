import {
    instanceOfAccountTransactionWithSignature,
    UpdateInstruction,
    instanceOfUpdateInstruction,
    Transaction,
} from './types';
import { findUpdateInstructionHandler } from './transactionHandlers/HandlerFinder';
import {
    serializeUpdateInstruction,
    serializeUpdateInstructionHeaderAndPayload,
} from './UpdateSerialization';
import { getAccountTransactionHash } from './transactionSerialization';
import { hashSha256 } from './serializationHelpers';
import { getBlockSummary, getConsensusStatus } from '~/utils/nodeRequests';
import { attachKeyIndex } from '~/utils/updates/AuthorizationHelper';

/**
 * Given an update instruction, return the transaction hash.
 */
export async function getUpdateInstructionTransactionHash(
    updateInstruction: UpdateInstruction
) {
    const handler = findUpdateInstructionHandler(updateInstruction.type);
    const consensusStatus = await getConsensusStatus();
    const blockSummary = await getBlockSummary(
        consensusStatus.lastFinalizedBlock
    );

    const signatures = await Promise.all(
        updateInstruction.signatures.map((sig) =>
            attachKeyIndex(sig, blockSummary, updateInstruction, handler)
        )
    );

    const serializedUpdateInstruction = serializeUpdateInstruction(
        updateInstruction,
        signatures,
        handler.serializePayload(updateInstruction)
    );

    return hashSha256(serializedUpdateInstruction).toString('hex');
}

/**
 * Given a transaction, return the digest, which does not contain the signature
 * And can be used to create the signature
 */
export default function getTransactionSignDigest(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        const handler = findUpdateInstructionHandler(transaction.type);
        return hashSha256(
            serializeUpdateInstructionHeaderAndPayload(
                transaction,
                handler.serializePayload(transaction)
            )
        ).toString('hex');
    }
    return getAccountTransactionHash(transaction, () => []).toString('hex');
}

/**
 * Given a transaction, return the transaction hash, which is the hash, that contains the signature.
 */
export function getTransactionHash(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return getUpdateInstructionTransactionHash(transaction);
    }
    if (instanceOfAccountTransactionWithSignature(transaction)) {
        return getAccountTransactionHash(
            transaction,
            () => transaction.signatures
        ).toString('hex');
    }
    throw new Error(
        'Unable to get hash for a transaction that is not an update instruction or an account transaction with a signature'
    );
}
