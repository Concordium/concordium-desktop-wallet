import React, { useEffect } from 'react';
import InlineNumber from '~/components/Form/InlineNumber';
import styles from './UpdateAccountCredentials.module.scss';

interface Props {
    setReady: (ready: boolean) => void;
    currentThreshold: number;
    newCredentialAmount: number;
    newThreshold: number | undefined;
    setNewThreshold: (threshold: number | undefined) => void;
}

function validateThreshold(threshold: number, max: number) {
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
    setReady,
    currentThreshold,
    newCredentialAmount,
    newThreshold,
    setNewThreshold,
}: Props): JSX.Element {
    useEffect(() => {
        setReady(
            newThreshold
                ? validateThreshold(newThreshold, newCredentialAmount)
                : false
        );
    }, [setReady, newThreshold, newCredentialAmount]);

    return (
        <>
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
                        setReady(
                            validateThreshold(
                                proposedThreshold,
                                newCredentialAmount
                            )
                        );
                    } else {
                        setReady(false);
                        setNewThreshold(undefined);
                    }
                }}
                value={
                    newThreshold !== undefined ? newThreshold.toString() : ''
                }
                min={1}
                max={newCredentialAmount}
                step={1}
            />
        </>
    );
}
