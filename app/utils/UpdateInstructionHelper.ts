import {
    UpdateHeader,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from './types';

export default function createUpdateInstruction<
    T extends UpdateInstructionPayload
>(
    updatePayload: T,
    updateType: UpdateType,
    sequenceNumber: BigInt,
    effectiveTime: BigInt
) {
    const expiry = BigInt(effectiveTime) - 1n;
    const updateHeader: UpdateHeader = {
        effectiveTime,
        sequenceNumber,
        timeout: expiry,
    };

    const updateInstruction: UpdateInstruction<T> = {
        header: updateHeader,
        payload: updatePayload,
        signatures: [],
        type: updateType,
    };

    return updateInstruction;
}
