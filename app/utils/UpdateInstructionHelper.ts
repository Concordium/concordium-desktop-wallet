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
    sequenceNumber: bigint,
    effectiveTime: bigint
) {
    const expiry = effectiveTime - 1n;
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
