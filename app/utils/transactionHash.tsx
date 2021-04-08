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

export function getUpdateInstructionHash(updateInstruction: UpdateInstruction) {
    const handler = findUpdateInstructionHandler(updateInstruction.type);

    const serializedUpdateInstruction = serializeUpdateInstruction(
        updateInstruction,
        handler.serializePayload(updateInstruction)
    );

    return hashSha256(serializedUpdateInstruction).toString('hex');
}

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

export function getTransactionSubmissionId(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        const handler = findUpdateInstructionHandler(transaction.type);

        const serializedUpdateInstruction = serializeUpdateInstruction(
            transaction,
            handler.serializePayload(transaction)
        );

        return hashSha256(serializedUpdateInstruction).toString('hex');
    }
    if (instanceOfAccountTransactionWithSignature(transaction)) {
        return getAccountTransactionHash(
            transaction,
            () => transaction.signatures
        ).toString('hex');
    }
    throw new Error(
        'Unable to get hash of Account Transaction without signature'
    );
}
