import {
    instanceOfAccountTransactionWithSignature,
    UpdateInstruction,
    instanceOfUpdateInstruction,
    Transaction,
} from './types';
import { findUpdateInstructionHandler } from './updates/HandlerFinder';
import { serializeUpdateInstruction } from './UpdateSerialization';
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
        return getUpdateInstructionHash(transaction);
    }
    if (instanceOfAccountTransactionWithSignature(transaction)) {
        return getAccountTransactionHash(
            transaction,
            () => transaction.signature
        ).toString('hex');
    }
    throw new Error(
        'Unable to get hash of Account Transaction without signature'
    );
}
