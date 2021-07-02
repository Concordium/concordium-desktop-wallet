import React from 'react';
import InlineNumber from '~/components/Form/InlineNumber';
import styles from './UpdateAccountCredentials.module.scss';

interface Props {
    currentThreshold: number;
    // newCredentialAmount: number;
    newThreshold: number | undefined;
    setNewThreshold: (threshold: number | undefined) => void;
}

export function validateThreshold(threshold: number, max: number) {
    if (!threshold) {
        return false;
    }
    if (threshold < 1) {
        return false;
    }
    return threshold <= max;
}

/**
 * Allows the user to change the signature threshold.
 */
export default function ChangeThreshold({
    currentThreshold,
    // newCredentialAmount,
    newThreshold,
    setNewThreshold,
}: Props): JSX.Element {
    return (
        <div>
            <h3 className={styles.bold}>
                Propose new signature threshold for the account?
            </h3>
            <p>
                If you want to update the amount of required signatures to make
                transactions from the account, you can do so below. If you do
                not want to make changes to the threshold, you can just leave it
                as it is.
            </p>

            <h3>Current signature threshold:</h3>
            <h1 className={styles.bold}>{currentThreshold}</h1>

            <h2>New signature threshold:</h2>
            <InlineNumber
                className={styles.inlineNumber}
                onChange={(v) => {
                    let proposedThreshold;
                    if (v) {
                        proposedThreshold = parseInt(v, 10);
                        setNewThreshold(proposedThreshold);
                    } else {
                        setNewThreshold(undefined);
                    }
                }}
                value={
                    newThreshold !== undefined ? newThreshold.toString() : ''
                }
            />
        </div>
    );
}
