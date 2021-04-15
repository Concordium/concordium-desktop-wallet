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

export function generateStatusLabelText(status: KeyUpdateEntryStatus) {
    switch (status) {
        case KeyUpdateEntryStatus.Added:
            return 'Added';
        case KeyUpdateEntryStatus.Removed:
            return 'Removed';
        case KeyUpdateEntryStatus.Unchanged:
            return 'Unchanged';
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

export function getStatusClassName(status: KeyUpdateEntryStatus) {
    switch (status) {
        case KeyUpdateEntryStatus.Added:
            return styles.added;
        case KeyUpdateEntryStatus.Removed:
            return styles.removed;
        case KeyUpdateEntryStatus.Unchanged:
            return styles.unchanged;
        default:
            return '';
    }
}

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
                <p className={styles.keyText}>{keyInput.verifyKey.verifyKey}</p>
                <h2 className={getStatusClassName(keyInput.status)}>
                    {generateStatusLabelText(keyInput.status)}
                </h2>
            </li>
        </>
    );
}
