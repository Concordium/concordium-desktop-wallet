import React from 'react';
import Button from '~/cross-app-components/Button';
import { VerifyKey } from '~/utils/types';
import styles from './KeyUpdateEntry.module.scss';

export enum KeyUpdateEntryStatus {
    Added,
    Removed,
    Unchanged,
}

export interface KeyUpdateEntryProps {
    status: KeyUpdateEntryStatus;
    verifyKey: VerifyKey;
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

function generateStatusLabelText(status: KeyUpdateEntryStatus) {
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

export default function KeyUpdateEntry({
    status,
    verifyKey,
}: KeyUpdateEntryProps) {
    return (
        <>
            <li className={styles.listItem}>
                <Button>{generateButtonText(status)}</Button>
                <p className={styles.keyText}>{verifyKey.verifyKey}</p>
                <h2>{generateStatusLabelText(status)}</h2>
            </li>
        </>
    );
}
