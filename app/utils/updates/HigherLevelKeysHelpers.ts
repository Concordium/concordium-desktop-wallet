import { Keys } from '../NodeApiTypes';
import { UpdateType } from '../types';

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
 * @param keys the keys object received from the block summary
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

// TODO This can be simplified to reduce the amount of switches in here to 1.

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
