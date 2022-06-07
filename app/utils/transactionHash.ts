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
import {
    getAccountTransactionHash,
    getAccountTransactionSignDigest,
} from './transactionSerialization';
import { hashSha256 } from './serializationHelpers';
import { fetchLastFinalizedBlockSummary } from '~/node/nodeHelpers';
import { attachKeyIndex } from '~/utils/updates/AuthorizationHelper';
import { throwLoggedError } from './basicHelpers';

/**
 * Given an update instruction, return the transaction hash.
 */
export async function getUpdateInstructionTransactionHash(
    updateInstruction: UpdateInstruction
) {
    const handler = findUpdateInstructionHandler(updateInstruction.type);
    const blockSummary = (await fetchLastFinalizedBlockSummary())
        .lastFinalizedBlockSummary;

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

    const hash = await hashSha256(serializedUpdateInstruction);
    return hash.toString('hex');
}

/**
 * Given a transaction, return the digest, which does not contain the signature
 * And can be used to create the signature
 */
export default function getTransactionSignDigest(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        const handler = findUpdateInstructionHandler(transaction.type);
        const updateHash = hashSha256(
            serializeUpdateInstructionHeaderAndPayload(
                transaction,
                handler.serializePayload(transaction)
            )
        );
        return updateHash.toString('hex');
    }
    const accountTransactionHash = getAccountTransactionSignDigest(transaction);
    return accountTransactionHash.toString('hex');
}

/**
 * Given a transaction, return the transaction hash, which is the hash, that contains the signature.
 */
export function getTransactionHash(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return getUpdateInstructionTransactionHash(transaction);
    }
    if (instanceOfAccountTransactionWithSignature(transaction)) {
        const accountTransactionHash = getAccountTransactionHash(
            transaction,
            transaction.signatures
        );
        return accountTransactionHash.toString('hex');
    }
    return throwLoggedError(
        'Unable to get hash for a transaction that is not an update instruction or an account transaction with a signature'
    );
}
