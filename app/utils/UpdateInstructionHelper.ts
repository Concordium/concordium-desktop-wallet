import {
    UpdateHeader,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from './types';

export function createUpdateInstruction<T extends UpdateInstructionPayload>(
    updatePayload: T,
    updateType: UpdateType,
    sequenceNumber: bigint,
    effectiveTime: bigint,
    expiry: bigint
) {
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

export function getUpdateQueueTypes(type: UpdateType) {
    const updateLevel1Keys = [
        UpdateType.UpdateLevel1KeysUsingLevel1Keys,
        UpdateType.UpdateLevel1KeysUsingRootKeys,
    ];
    if (updateLevel1Keys.includes(type)) {
        return updateLevel1Keys;
    }
    const updateLevel2Keys = [
        UpdateType.UpdateLevel2KeysUsingLevel1Keys,
        UpdateType.UpdateLevel2KeysUsingRootKeys,
    ];
    if (updateLevel2Keys.includes(type)) {
        return updateLevel2Keys;
    }
    return [type];
}
