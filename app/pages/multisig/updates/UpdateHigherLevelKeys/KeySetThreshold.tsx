import React, { useState } from 'react';
import InlineNumber from '~/components/Form/InlineNumber';
import Button from '~/cross-app-components/Button';
import { UpdateType } from '~/utils/types';
import { typeToDisplay } from '~/utils/updates/HigherLevelKeysHelpers';
import styles from './KeySetThreshold.module.scss';

interface Props {
    type: UpdateType;
    currentThreshold: number;
    maxThreshold: number;
    setThreshold: React.Dispatch<React.SetStateAction<number>>;
    submitFunction(): void;
}

function isInvalid(
    threshold: string | undefined,
    maxThreshold: number
): boolean {
    if (threshold === undefined) {
        return true;
    }
    const thresholdAsNumber = Number.parseInt(threshold, 10);
    return thresholdAsNumber <= 0 || thresholdAsNumber > maxThreshold;
}

/**
 * Component for displaying the current signature threshold for the key set, and for
 * letting the user input an updated signature threshold.
 */
export default function KeySetThreshold({
    type,
    maxThreshold,
    currentThreshold,
    setThreshold,
    submitFunction,
}: Props) {
    const [threshold, setLocalThreshold] = useState<string | undefined>(
        currentThreshold.toString()
    );

    return (
        <>
            <div>
                <h3>
                    Propose a new signature threshold for {typeToDisplay(type)}{' '}
                    keys
                </h3>
                <p>
                    If you want to update the amount of required{' '}
                    {typeToDisplay(type)} key signatures to make transactions,
                    then you can do so below. If you do not want to make any c
                    hanges to the threshold, then you can just leave it as is.
                </p>
                <h2>Current signature threshold</h2>
                <h1>{currentThreshold}</h1>
                <h2>New signature threshold</h2>
                <InlineNumber
                    className={styles.inputField}
                    value={threshold}
                    onChange={(v) => {
                        setLocalThreshold(v);
                        setThreshold(
                            Number.parseInt(v !== undefined ? v : '0', 10)
                        );
                    }}
                    fallbackValue={1}
                />
            </div>
            <Button
                disabled={isInvalid(threshold, maxThreshold)}
                onClick={submitFunction}
            >
                Continue
            </Button>
        </>
    );
}
