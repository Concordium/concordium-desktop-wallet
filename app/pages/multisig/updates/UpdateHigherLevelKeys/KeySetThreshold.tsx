import React, { useState } from 'react';
import InlineNumber from '~/components/Form/InlineNumber';
import Button from '~/cross-app-components/Button';
import { UpdateType } from '~/utils/types';
import styles from './KeySetThreshold.module.scss';

// TODO The continue button should drop to the bottom. Howto when it is inside a form?
// TODO Max value of threshold should be set to the length of the current key set.

interface Props {
    type: UpdateType;
    currentThreshold: number;
    setThreshold: React.Dispatch<React.SetStateAction<number>>;
    submitFunctionTest(): void;
}

// TODO This function is a duplicate and should be shared instead.
function typeToDisplay(type: UpdateType) {
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
 * Component for displaying the current signature threshold for the key set, and for
 * letting the user input an updated signature threshold.
 */
export default function KeySetThreshold({
    type,
    currentThreshold,
    setThreshold,
    submitFunctionTest,
}: Props) {
    const [threshold, setLocalThreshold] = useState<string | undefined>(
        currentThreshold.toString()
    );

    return (
        <>
            <div>
                <h2>
                    Propose a new signature threshold for {typeToDisplay(type)}{' '}
                    keys
                </h2>
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
            <Button onClick={submitFunctionTest}>Continue</Button>
        </>
    );
}
