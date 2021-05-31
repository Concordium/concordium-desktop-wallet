import React, { useMemo, useState } from 'react';
import Columns from '~/components/Columns/Columns';
import InputTimestamp from '~/components/Form/InputTimestamp/InputTimestamp';
import Button from '~/cross-app-components/Button';
import { BlockSummary, Key } from '~/node/NodeApiTypes';
import {
    getDefaultExpiry,
    getFormattedDateString,
    isFutureDate,
    subtractHours,
    TimeConstants,
} from '~/utils/timeHelpers';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    KeyWithStatus,
    UpdateType,
} from '~/utils/types';
import styles from '../../common/MultiSignatureFlowPage.module.scss';
import { KeyUpdateEntry } from './KeyUpdateEntry';
import {
    mapCurrentAuthorizationsToUpdate,
    getAccessStructureTitle,
} from './util';

interface Props {
    blockSummary: BlockSummary;
    type: UpdateType;
    handleKeySubmit(
        effectiveTime: Date,
        expiryTime: Date,
        authorizationKeysUpdate: Partial<AuthorizationKeysUpdate>
    ): Promise<void>;
}

export default function UpdateAuthorizationKeys({
    blockSummary,
    type,
    handleKeySubmit,
}: Props) {
    const [effectiveTime, setEffectiveTime] = useState<Date | undefined>(
        new Date(getDefaultExpiry().getTime() + 5 * TimeConstants.Minute)
    );
    const [expiryTime, setExpiryTime] = useState<Date | undefined>(
        getDefaultExpiry()
    );

    const currentKeys = blockSummary.updates.keys.level2Keys.keys;
    const currentKeySetSize = currentKeys.length;
    const currentAuthorizations = blockSummary.updates.keys.level2Keys;

    const [newLevel2Keys, setNewLevel2Keys] = useState<AuthorizationKeysUpdate>(
        mapCurrentAuthorizationsToUpdate(currentAuthorizations)
    );

    function updateKey(accessStructure: AccessStructure) {
        return (keyToUpdate: KeyWithStatus) => {
            // let removeAddedKey = false;
            const keyIndex = newLevel2Keys.keys.findIndex(
                (value) => value.verifyKey === keyToUpdate.key.verifyKey
            );

            const updatedAccessStructures = newLevel2Keys.accessStructures.map(
                (currentAccessStructure) => {
                    if (accessStructure.type === currentAccessStructure.type) {
                        const updatedAccessStructureIndicies = accessStructure.publicKeyIndicies.map(
                            (value) => {
                                if (value.index === keyIndex) {
                                    return {
                                        index: value.index,
                                        status: keyToUpdate.status,
                                    };
                                }
                                return value;
                            }
                        );
                        return {
                            ...currentAccessStructure,
                            publicKeyIndicies: updatedAccessStructureIndicies,
                        };
                    }
                    return currentAccessStructure;
                }
            );

            const updatedLevel2Keys = {
                ...newLevel2Keys,
                accessStructures: updatedAccessStructures,
            };

            setNewLevel2Keys(updatedLevel2Keys);
        };
    }

    const expiryTimeError = useMemo(() => {
        if (expiryTime === undefined) {
            return undefined;
        }
        if (!isFutureDate(expiryTime)) {
            return 'Transaction expiry time must be in the future';
        }
        if (effectiveTime !== undefined && effectiveTime < expiryTime) {
            return 'Expiry must be before the effective time';
        }
        return undefined;
    }, [effectiveTime, expiryTime]);

    function displayAccessStructure(
        accessStructure: AccessStructure,
        keys: Key[]
    ) {
        return (
            <div key={accessStructure.type}>
                <h2>{getAccessStructureTitle(accessStructure.type)}</h2>
                <ul>
                    {accessStructure.publicKeyIndicies.map((publicKeyIndex) => {
                        const matchingKey = keys.find(
                            (_, index) => index === publicKeyIndex.index
                        );
                        if (!matchingKey) {
                            throw new Error(
                                'A matching key was not found for the key index. This should never occur.'
                            );
                        }

                        return (
                            <KeyUpdateEntry
                                key={matchingKey.verifyKey}
                                updateKey={updateKey(accessStructure)}
                                keyInput={{
                                    status: publicKeyIndex.status,
                                    key: matchingKey,
                                }}
                            />
                        );
                    })}
                </ul>
            </div>
        );
    }

    function submitFunction() {
        if (!effectiveTime) {
            return;
        }
        if (!expiryTime) {
            return;
        }
        handleKeySubmit(effectiveTime, expiryTime, {
            ...newLevel2Keys,
            keyUpdateType: 2,
        });
    }

    return (
        <Columns divider columnScroll columnClassName={styles.column}>
            <Columns.Column header="Transaction Details">
                <div className={styles.columnContent}>
                    <p>{type}</p>
                    <p>
                        Current size of level 2 key set:{' '}
                        <b>{currentKeySetSize}</b>
                    </p>
                    <p>
                        New size of level 2 key set:{' '}
                        <b>{newLevel2Keys.keys.length}</b>
                    </p>
                    {newLevel2Keys.accessStructures.map((accessStructure) => {
                        return displayAccessStructure(
                            accessStructure,
                            newLevel2Keys.keys
                        );
                    })}
                    <h5>Effective time</h5>
                    <InputTimestamp
                        value={effectiveTime}
                        onChange={setEffectiveTime}
                    />
                    <h5>Transaction expiry time</h5>
                    <InputTimestamp
                        value={expiryTime}
                        onChange={setExpiryTime}
                        isInvalid={expiryTimeError !== undefined}
                        error={expiryTimeError}
                    />
                    {expiryTime !== undefined ? (
                        <p>
                            Note: A transaction can only be submitted in the 2
                            hours before the expiry <br /> (
                            {getFormattedDateString(
                                subtractHours(2, expiryTime)
                            )}
                            )
                        </p>
                    ) : undefined}
                </div>
            </Columns.Column>
            <Columns.Column>
                <Button onClick={submitFunction}>Submit</Button>
            </Columns.Column>
        </Columns>
    );
}
