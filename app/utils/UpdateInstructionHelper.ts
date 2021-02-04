import { BlockSummary } from './NodeApiTypes';
import {
    MultiSignatureTransaction,
    UpdateHeader,
    UpdateInstruction,
    UpdateType,
} from './types';

/**
 * The Props interface used by components for handling parameter update
 * transactions.
 */
export interface UpdateProps {
    blockSummary: BlockSummary;
    generateTransaction: (
        multiSignatureTransaction: MultiSignatureTransaction
    ) => Promise<void>;
}

// TODO Effective time should perhaps have a default, but it should also be possible to
// provide the value as input, so that the user can decide the value.
// Where to get the sequence number from?

export default function createUpdateInstruction(
    updatePayload,
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
