import { UpdateHeader, UpdateInstruction, UpdateType } from './types';

// TODO Effective time should perhaps have a default, but it should also be possible to
// provide the value as input, so that the user can decide the value.
// Where to get the sequence number from?

export default function createUpdateInstruction(
    updatePayload,
    updateType: UpdateType
) {
    const updateHeader: UpdateHeader = {
        effectiveTime: Date.now() + 864000000,
        sequenceNumber: 0,
        timeout: Date.now() + 864000000 * 7,
    };

    const updateInstruction: UpdateInstruction = {
        header: updateHeader,
        payload: updatePayload,
        signatures: [],
        type: updateType,
    };

    return updateInstruction;
}
