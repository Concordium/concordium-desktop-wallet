import { Keys } from '../NodeApiTypes';
import {
    HigherLevelKeyUpdate,
    KeyUpdateEntryStatus,
    UpdateType,
} from '../types';

/**
 * Removes any keys with the Removed status from the payload. This is useful
 * as those be skipped in the serialization, as they should not be sent to
 * signing or the chain. This is needed as the model on client side contains
 * some extra information that is required by the UI.
 */
export function removeRemovedKeys(
    payload: HigherLevelKeyUpdate
): HigherLevelKeyUpdate {
    const keysWithoutRemoved = payload.updateKeys.filter(
        (key) => key.status !== KeyUpdateEntryStatus.Removed
    );
    return {
        ...payload,
        updateKeys: keysWithoutRemoved,
    };
}

/**
 * Maps a higher level key update type to a display
 * text string that can be used to show in the UI.
 */
export function typeToDisplay(type: UpdateType) {
    switch (type) {
        case UpdateType.UpdateRootKeys:
            return 'root';
        case UpdateType.UpdateLevel1KeysUsingRootKeys:
            return 'level 1';
        default:
            throw new Error(
                `The update type is not a higher level key update: ${type}`
            );
    }
}

/**
 * Extracts the signature threshold for the provided update type.
 * @param keys the keys object received in the block summary
 * @param type the type of key update
 * @returns the signature threshold for the provided update type
 */
export function getThreshold(keys: Keys, type: UpdateType) {
    switch (type) {
        case UpdateType.UpdateRootKeys:
            return keys.rootKeys.threshold;
        case UpdateType.UpdateLevel1KeysUsingRootKeys:
            return keys.level1Keys.threshold;
        default:
            throw new Error(
                `The update type is not a higher level key update: ${type}`
            );
    }
}

/**
 * Get the number of keys for the key set that matches
 * the provided update type.
 * @param keys the keys object received in the block summary
 * @param type the type of key update
 * @returns the number of keys for the provided update type
 */
export function getKeySetSize(keys: Keys, type: UpdateType) {
    switch (type) {
        case UpdateType.UpdateRootKeys:
            return keys.rootKeys.keys.length;
        case UpdateType.UpdateLevel1KeysUsingRootKeys:
            return keys.level1Keys.keys.length;
        default:
            throw new Error(
                `The update type is not a higher level key update: ${type}`
            );
    }
}
