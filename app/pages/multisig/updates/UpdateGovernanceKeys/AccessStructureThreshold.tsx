import React, { useState } from 'react';
import InlineNumber from '~/components/Form/InlineNumber';
import Button from '~/cross-app-components/Button';
import { AccessStructure, AccessStructureEnum } from '~/utils/types';
import styles from './KeySetThreshold.module.scss';
import { getAccessStructureTitle } from './util';

interface Props {
    accessStructures: AccessStructure[];
    currentThresholds: Map<AccessStructureEnum, number>;
    setThreshold(type: AccessStructureEnum, threshold: number): void;
    submitFunction(): void;
}

/**
 * Checks if any of the thresholds exceeds the number of key indices for
 * that access structure. If that is the case, then the transaction is considered
 * invalid.
 */
function isInvalid(
    thresholds: Map<AccessStructureEnum, number>,
    accessStructures: AccessStructure[]
): boolean {
    const accountStructureWithInvalidThreshold = accessStructures.find(
        (accessStructure) => {
            const threshold = thresholds.get(accessStructure.type);
            if (threshold) {
                return (
                    threshold <= 0 ||
                    threshold > accessStructure.publicKeyIndicies.length
                );
            }
            return true;
        }
    );

    if (accountStructureWithInvalidThreshold) {
        return true;
    }
    return false;
}

/**
 * Component for displaying the current signature thresholds for each access structure,
 * and for letting the user input an updated signature threshold for each of the access
 * structures.
 */
export default function AccessStructureThreshold({
    accessStructures,
    currentThresholds,
    submitFunction,
    setThreshold,
}: Props) {
    const [thresholds, setLocalThresholds] = useState<
        Map<AccessStructureEnum, number>
    >(currentThresholds);

    function updateLocalThreshold(
        threshold: string | undefined,
        type: AccessStructureEnum
    ) {
        if (threshold) {
            const updatedThresholds = thresholds;
            updatedThresholds?.set(type, parseInt(threshold, 10));
            setLocalThresholds(updatedThresholds);
        }
    }

    return (
        <>
            <div>
                <h3>Propose new signature thresholds</h3>
                <p>
                    If you want to update the amount of required signatures to
                    make transactions, then you can do so below. If you do not
                    want to make any changes to the thresholds, then you can
                    just leave it as is.
                </p>
                {accessStructures.map((accessStructure) => {
                    return (
                        <div
                            key={accessStructure.type}
                            className={styles.accessStructure}
                        >
                            <h2>
                                {getAccessStructureTitle(accessStructure.type)}
                            </h2>
                            <h3>Current signature threshold</h3>
                            <h1>{accessStructure.threshold}</h1>
                            <h3>New signature threshold</h3>
                            <InlineNumber
                                className={styles.inputField}
                                value={thresholds
                                    .get(accessStructure.type)
                                    ?.toString()}
                                onChange={(v) => {
                                    updateLocalThreshold(
                                        v,
                                        accessStructure.type
                                    );
                                    setThreshold(
                                        accessStructure.type,
                                        Number.parseInt(
                                            v !== undefined ? v : '1',
                                            10
                                        )
                                    );
                                }}
                                fallbackValue={1}
                            />
                        </div>
                    );
                })}
            </div>
            <Button
                onClick={submitFunction}
                disabled={isInvalid(thresholds, accessStructures)}
            >
                Continue
            </Button>
        </>
    );
}
