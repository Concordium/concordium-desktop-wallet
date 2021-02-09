import { stringify } from 'json-bigint';
import {
    AccountTransaction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateInstruction,
    UpdateInstructionPayload,
} from './types';

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
    const multiSignatureTransaction: Partial<MultiSignatureTransaction> = {
        transaction: stringify(transaction),
        threshold,
        status,
    };
    return multiSignatureTransaction;
}
