import React, { useMemo, useState } from 'react';
import { Route, Switch } from 'react-router';
import Columns from '~/components/Columns/Columns';
import InputTimestamp from '~/components/Form/InputTimestamp/InputTimestamp';
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
    KeyUpdateEntryStatus,
    KeyWithStatus,
    PublicKeyExportFormat,
    UpdateType,
    VerifyKey,
} from '~/utils/types';
import styles from '../../common/MultiSignatureFlowPage.module.scss';
import { KeyUpdateEntry } from './KeyUpdateEntry';
import {
    mapCurrentAuthorizationsToUpdate,
    getAccessStructureTitle,
    keyIsInUse,
    getCurrentThresholds,
} from './util';
import routes from '~/constants/routes.json';
import ProposeNewKey from './ProposeNewKey';
import AccessStructureKeySetSize from './AccessStructureKeySetSize';
import AccessStructureThreshold from './AccessStructureThreshold';

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
    const currentAccessStructures = mapCurrentAuthorizationsToUpdate(
        currentAuthorizations
    ).accessStructures;
    const currentThresholds = getCurrentThresholds(currentAuthorizations);

    const [newLevel2Keys, setNewLevel2Keys] = useState<AuthorizationKeysUpdate>(
        mapCurrentAuthorizationsToUpdate(currentAuthorizations)
    );

    /**
     * A new key is always added to all access structures. This is done to
     * simplify the current implementation, not due to any requirements.
     */
    function addNewKey(publicKey: PublicKeyExportFormat) {
        const updatedKeys: VerifyKey[] = [...newLevel2Keys.keys, publicKey.key];
        const addedKeyIndex = updatedKeys.length - 1;

        const updatedAccessStructures = newLevel2Keys.accessStructures.map(
            (accessStructure) => {
                const updatedAccessStructure: AccessStructure = {
                    ...accessStructure,
                    publicKeyIndicies: [
                        ...accessStructure.publicKeyIndicies,
                        {
                            index: addedKeyIndex,
                            status: KeyUpdateEntryStatus.Added,
                        },
                    ],
                };
                return updatedAccessStructure;
            }
        );

        const updatedLevel2Keys: AuthorizationKeysUpdate = {
            keys: updatedKeys,
            keyUpdateType: newLevel2Keys.keyUpdateType,
            accessStructures: updatedAccessStructures,
        };
        setNewLevel2Keys(updatedLevel2Keys);
    }

    function updateKey(accessStructure: AccessStructure) {
        return (keyToUpdate: KeyWithStatus) => {
            let removeAddedKey = false;
            const keyIndex = newLevel2Keys.keys.findIndex(
                (value) => value.verifyKey === keyToUpdate.key.verifyKey
            );

            const updatedAccessStructures = newLevel2Keys.accessStructures.map(
                (currentAccessStructure) => {
                    if (accessStructure.type === currentAccessStructure.type) {
                        const updatedAccessStructureIndicies = accessStructure.publicKeyIndicies
                            .map((value) => {
                                if (value.index === keyIndex) {
                                    // For the special case where the key was not in the current key set, i.e. it was added,
                                    // then we remove it entirely if set to removed instead of just updating the status.
                                    if (
                                        value.status ===
                                            KeyUpdateEntryStatus.Added &&
                                        keyToUpdate.status ===
                                            KeyUpdateEntryStatus.Removed
                                    ) {
                                        removeAddedKey = true;
                                    }

                                    return {
                                        index: value.index,
                                        status: keyToUpdate.status,
                                    };
                                }
                                return value;
                            })
                            .filter(
                                (value) =>
                                    !(
                                        removeAddedKey &&
                                        keyIndex === value.index
                                    )
                            );

                        return {
                            ...currentAccessStructure,
                            publicKeyIndicies: updatedAccessStructureIndicies,
                        };
                    }
                    return currentAccessStructure;
                }
            );

            // If removing an added key, and no access structure refers to it anymore,
            // then we remove the key entirely.
            let updatedKeys = newLevel2Keys.keys;
            if (
                removeAddedKey &&
                !keyIsInUse(keyIndex, updatedAccessStructures)
            ) {
                updatedKeys = newLevel2Keys.keys.filter(
                    (_, index) => index !== keyIndex
                );
            }

            const updatedLevel2Keys: AuthorizationKeysUpdate = {
                ...newLevel2Keys,
                keys: updatedKeys,
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
            <Columns.Column className={styles.stretchColumn} header={' '}>
                <div className={styles.columnContent}>
                    <Switch>
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_PROPOSAL_KEY_SET_THRESHOLD
                            }
                            render={() => (
                                <AccessStructureThreshold
                                    accessStructures={currentAccessStructures}
                                    currentThresholds={currentThresholds}
                                    submitFunction={submitFunction}
                                />
                            )}
                        />
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_PROPOSAL_KEY_SET_SIZE
                            }
                            render={() => (
                                <AccessStructureKeySetSize type={type} />
                            )}
                        />
                        <Route
                            path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                            render={() => (
                                <ProposeNewKey
                                    type={type}
                                    addKey={addNewKey}
                                    newKeys={newLevel2Keys.keys}
                                />
                            )}
                        />
                    </Switch>
                </div>
            </Columns.Column>
        </Columns>
    );
}
