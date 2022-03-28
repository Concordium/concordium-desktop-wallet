import { stringify } from './JSONHelper';
import {
    AccountTransaction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from './types';
import { createUpdateInstruction } from './UpdateInstructionHelper';

/**
 * Creates a multi signature transaction for the given input.
 * @param transaction either an update instruction or an account transaction
 * @param threshold the signature threshold required by the chain
 * @param status the current status of multi signature transaction
 */
export default function createMultiSignatureTransaction(
    transaction:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction,
    threshold: number,
    status: MultiSignatureTransactionStatus
) {
    const multiSignatureTransaction: Omit<MultiSignatureTransaction, 'id'> = {
        transaction: stringify(transaction),
        threshold,
        status,
    };
    return multiSignatureTransaction;
}

/**
 * Creates a multi signature transaction for an update instruction in its initial
 * open status.
 */
export function createUpdateMultiSignatureTransaction(
    payload: UpdateInstructionPayload,
    updateType: UpdateType,
    sequenceNumber: bigint,
    threshold: number,
    effectiveTime: bigint,
    expiryTime: bigint
) {
    const updateInstruction = createUpdateInstruction(
        payload,
        updateType,
        sequenceNumber,
        effectiveTime,
        expiryTime
    );
    return createMultiSignatureTransaction(
        updateInstruction,
        threshold,
        MultiSignatureTransactionStatus.Open
    );
}
