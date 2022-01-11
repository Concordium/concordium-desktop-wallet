import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import InlineNumber from '~/components/Form/InlineNumber';
import Button from '~/cross-app-components/Button';
import {
    AccessStructure,
    AccessStructureEnum,
    KeyUpdateEntryStatus,
    UpdateType,
    TransactionTypes,
} from '~/utils/types';
import styles from './KeySetThreshold.module.scss';
import { getAccessStructureTitle } from './util';
import { createProposalRoute } from '~/utils/routerHelper';
import Label from '~/components/Label';

interface Props {
    currentAccessStructures: AccessStructure[];
    newAccessStructures: AccessStructure[];
    currentThresholds: Map<AccessStructureEnum, number>;
    setThreshold(type: AccessStructureEnum, threshold: number): void;
    type: UpdateType;
}

function getThreshold(
    type: AccessStructureEnum,
    accessStructures: AccessStructure[]
) {
    return accessStructures.find((accessStructure) => {
        return accessStructure.type === type;
    })?.threshold;
}

/**
 * Checks if any of the thresholds exceeds the number of key indices for
 * that access structure. If that is the case, then the transaction is considered
 * invalid.
 */
function isInvalid(
    thresholds: Map<AccessStructureEnum, number>,
    newAccessStructures: AccessStructure[]
): boolean {
    const accountStructureWithInvalidThreshold = newAccessStructures.find(
        (accessStructure) => {
            const threshold = thresholds.get(accessStructure.type);
            if (threshold) {
                return (
                    threshold <= 0 ||
                    threshold >
                        accessStructure.publicKeyIndicies.filter(
                            (idx) => idx.status !== KeyUpdateEntryStatus.Removed
                        ).length
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
    currentAccessStructures,
    newAccessStructures,
    currentThresholds,
    setThreshold,
    type,
}: Props) {
    const dispatch = useDispatch();
    const [thresholds, setLocalThresholds] = useState<
        Map<AccessStructureEnum, number>
    >(currentThresholds);

    function updateLocalThreshold(
        threshold: string | undefined,
        structureType: AccessStructureEnum
    ) {
        if (threshold) {
            const updatedThresholds = thresholds;
            updatedThresholds?.set(structureType, parseInt(threshold, 10));
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
                {newAccessStructures.map((newAccessStructure) => {
                    return (
                        <div
                            key={newAccessStructure.type}
                            className={styles.accessStructure}
                        >
                            <div className="mono body3 mB10">
                                Current signature threshold:{' '}
                                {getThreshold(
                                    newAccessStructure.type,
                                    currentAccessStructures
                                )}
                            </div>
                            <Label className="mB5">
                                {getAccessStructureTitle(
                                    newAccessStructure.type
                                )}{' '}
                                signature threshold
                            </Label>
                            <InlineNumber
                                className={styles.inputField}
                                value={newAccessStructure.threshold?.toString()}
                                onChange={(v) => {
                                    updateLocalThreshold(
                                        v,
                                        newAccessStructure.type
                                    );
                                    setThreshold(
                                        newAccessStructure.type,
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
                onClick={() =>
                    dispatch(
                        push(
                            `${createProposalRoute(
                                TransactionTypes.UpdateInstruction,
                                type
                            )}/seteffectiveexpiry`
                        )
                    )
                }
                disabled={isInvalid(thresholds, newAccessStructures)}
            >
                Continue
            </Button>
        </>
    );
}
