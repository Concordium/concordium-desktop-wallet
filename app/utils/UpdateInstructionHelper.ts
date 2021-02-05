import { parse } from 'json-bigint';
import { BlockSummary } from './NodeApiTypes';
import {
    ExchangeRate,
    MultiSignatureTransaction,
    UpdateHeader,
    UpdateInstruction,
    UpdateType,
} from './types';
import UpdateInstructionHandler from './UpdateInstructionHandler';

export interface TransactionInput {
    transaction: string;
    type: string;
}

/**
 * The Props interface used by components for handling parameter update
 * transactions.
 */
export interface UpdateProps {
    blockSummary: BlockSummary;
    forwardTransaction: (
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) => Promise<void>;
}

// TODO Effective time should perhaps have a default, but it should also be possible to
// provide the value as input, so that the user can decide the value.
// Where to get the sequence number from?
// TODO Add other update types as they are implemented.

export default function createUpdateInstruction(
    updatePayload: ExchangeRate,
    updateType: UpdateType,
    sequenceNumber: BigInt
) {
    const updateHeader: UpdateHeader = {
        effectiveTime: BigInt(Date.now()) + 864000000n,
        sequenceNumber,
        timeout: BigInt(Date.now()) + 864000000n * 7n,
    };

    const updateInstruction: UpdateInstruction = {
        header: updateHeader,
        payload: updatePayload,
        signatures: [],
        type: updateType,
    };

    return updateInstruction;
}

export function createTransactionHandler(state: TransactionInput | undefined) {
    if (!state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }
    const { transaction, type } = state;

    const transactionObject = parse(transaction);
    // TODO Add AccountTransactionHandler here when implemented.
    const transactionHandlerValue =
        type === 'UpdateInstruction'
            ? new UpdateInstructionHandler(transactionObject)
            : new UpdateInstructionHandler(transactionObject);
    return transactionHandlerValue;
}
