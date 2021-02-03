import {
    UpdateHeader,
    UpdateInstruction,
    UpdateType,
    ExchangeRate,
} from './types';

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
