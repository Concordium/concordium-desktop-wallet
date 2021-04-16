import {
    instanceOfAccountTransactionWithSignature,
    UpdateInstruction,
    instanceOfUpdateInstruction,
    Transaction,
} from './types';
import { findUpdateInstructionHandler } from './updates/HandlerFinder';
import {
    serializeUpdateInstruction,
    serializeUpdateInstructionHeaderAndPayload,
} from './UpdateSerialization';
import { getAccountTransactionHash } from './transactionSerialization';
import { hashSha256 } from './serializationHelpers';

/**
 * Given an update instruction, return the submissionId, which is the hash, that contains the signature.
 */
export function getUpdateInstructionSubmissionId(
    updateInstruction: UpdateInstruction
) {
    const handler = findUpdateInstructionHandler(updateInstruction.type);

    const serializedUpdateInstruction = serializeUpdateInstruction(
        updateInstruction,
        handler.serializePayload(updateInstruction)
    );

    return hashSha256(serializedUpdateInstruction).toString('hex');
}

/**
 * Given a transaction, return the hash, which does not contain the signature
 * And can be used to create the signature
 */
export default function getTransactionHash(transaction: Transaction) {
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
 * Given a transaction, return the submissionId, which is the hash, that contains the signature.
 */
export function getTransactionSubmissionId(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        getUpdateInstructionSubmissionId(transaction);
    }
    if (instanceOfAccountTransactionWithSignature(transaction)) {
        return getAccountTransactionHash(
            transaction,
            () => transaction.signatures
        ).toString('hex');
    }
    throw new Error(
        'Unable to get submissionId of Account Transaction without signature'
    );
}
