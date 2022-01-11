import React from 'react';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import { KeyUpdateEntryStatus, KeyWithStatus } from '~/utils/types';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';
import styles from './KeyUpdateEntry.module.scss';

export interface KeyUpdateEntryProps {
    keyInput: KeyWithStatus;
    updateKey?: (keyToUpdate: KeyWithStatus) => void;
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
            return <div className={styles.added}>Added</div>;
        case KeyUpdateEntryStatus.Removed:
            return <div className={styles.removed}>Removed</div>;
        case KeyUpdateEntryStatus.Unchanged:
            return <div className={styles.unchanged}>Unchanged</div>;
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
export function KeyUpdateEntry({ keyInput, updateKey }: KeyUpdateEntryProps) {
    return (
        <>
            <li className={styles.listItem}>
                {generateStatusLabel(keyInput.status)}
                <div
                    className={clsx(
                        'flex alignCenter justifyCenter',
                        updateKey && styles.appendage
                    )}
                >
                    {updateKey && (
                        <div className="flex flexChildFill">
                            <Button
                                size="tiny"
                                onClick={() =>
                                    updateKey(updateKeyStatus(keyInput))
                                }
                                className={styles.button}
                            >
                                {generateButtonText(keyInput.status)}
                            </Button>
                        </div>
                    )}
                    <PublicKeyDetails
                        className={styles.keyText}
                        publicKey={keyInput.key.verifyKey}
                    />
                </div>
            </li>
        </>
    );
}
