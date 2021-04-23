import React from 'react';
import Button from '~/cross-app-components/Button';
import { KeyUpdateEntryStatus, KeyWithStatus } from '~/utils/types';
import styles from './KeyUpdateEntry.module.scss';

export interface KeyUpdateEntryProps {
    keyInput: KeyWithStatus;
    updateKey(keyToUpdate: KeyWithStatus): void;
}

function generateButtonText(status: KeyUpdateEntryStatus) {
    switch (status) {
        case KeyUpdateEntryStatus.Added:
            return 'Remove';
        case KeyUpdateEntryStatus.Removed:
            return 'Revert';
        case KeyUpdateEntryStatus.Unchanged:
            return 'Remove';
        default:
            throw new Error(`Unsupported status type: ${status}`);
    }
}

export function generateStatusLabel(status: KeyUpdateEntryStatus) {
    switch (status) {
        case KeyUpdateEntryStatus.Added:
            return <h2 className={styles.added}>Added</h2>;
        case KeyUpdateEntryStatus.Removed:
            return <h2 className={styles.removed}>Removed</h2>;
        case KeyUpdateEntryStatus.Unchanged:
            return <h2 className={styles.unchanged}>Unchanged</h2>;
        default:
            throw new Error(`Unsupported status type: ${status}`);
    }
}

function updateKeyStatus(key: KeyWithStatus) {
    let updatedStatus = key.status;
    if (
        key.status === KeyUpdateEntryStatus.Unchanged ||
        key.status === KeyUpdateEntryStatus.Added
    ) {
        updatedStatus = KeyUpdateEntryStatus.Removed;
    } else if (key.status === KeyUpdateEntryStatus.Removed) {
        updatedStatus = KeyUpdateEntryStatus.Unchanged;
    }

    return {
        ...key,
        status: updatedStatus,
    };
}

/**
 * Component for displaying a key update entry. The status of the entry
 * can be updated by clicking the button to remove the key, or to revert
 * the removal of the key, depending on the status of the entry.
 */
export default function KeyUpdateEntry({
    keyInput,
    updateKey,
}: KeyUpdateEntryProps) {
    return (
        <>
            <li className={styles.listItem}>
                <Button onClick={() => updateKey(updateKeyStatus(keyInput))}>
                    {generateButtonText(keyInput.status)}
                </Button>
                <p className={styles.keyText}>{keyInput.key.verifyKey}</p>
                {generateStatusLabel(keyInput.status)}
            </li>
        </>
    );
}
