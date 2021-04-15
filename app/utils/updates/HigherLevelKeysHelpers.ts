import { Keys } from '../NodeApiTypes';
import { HigherLevelKeyUpdateType, UpdateType } from '../types';

/**
 * Helper for mapping an update type to its HigherLevelKeyUpdateType, which
 * is a pre-fix integer used in key updates as part of the transaction.
 * @param type
 * @returns
 */
export function typeToHigherLevelKeyUpdateType(
    type: UpdateType
): HigherLevelKeyUpdateType {
    switch (type) {
        case UpdateType.UpdateRootKeysWithRootKeys:
            return 0;
        case UpdateType.UpdateLevel1KeysWithRootKeys:
            return 1;
        case UpdateType.UpdateLevel1KeysWithLevel1Keys:
            return 0;
        default:
            throw new Error(
                `The update type is not a higher level key update: ${type}`
            );
    }
}

/**
 * Maps a higher level key update type to a display
 * text string that can be used to show in the UI.
 */
export function typeToDisplay(type: UpdateType) {
    switch (type) {
        case UpdateType.UpdateRootKeysWithRootKeys:
            return 'root';
        case UpdateType.UpdateLevel1KeysWithRootKeys:
            return 'level 1';
        case UpdateType.UpdateLevel1KeysWithLevel1Keys:
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
        case UpdateType.UpdateRootKeysWithRootKeys:
            return keys.rootKeys.threshold;
        case UpdateType.UpdateLevel1KeysWithRootKeys:
            return keys.rootKeys.threshold;
        case UpdateType.UpdateLevel1KeysWithLevel1Keys:
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
        case UpdateType.UpdateRootKeysWithRootKeys:
            return keys.rootKeys.keys.length;
        case UpdateType.UpdateLevel1KeysWithRootKeys:
            return keys.rootKeys.keys.length;
        case UpdateType.UpdateLevel1KeysWithLevel1Keys:
            return keys.level1Keys.keys.length;
        default:
            throw new Error(
                `The update type is not a higher level key update: ${type}`
            );
    }
}
