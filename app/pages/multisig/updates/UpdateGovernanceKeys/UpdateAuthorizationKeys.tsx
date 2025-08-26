import React, { useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { FieldValues } from 'react-hook-form';
import Columns from '~/components/Columns/Columns';
import { ChainParameters, Key, ConsensusStatus } from '~/node/NodeApiTypes';
import {
    AccessStructure,
    AccessStructureEnum,
    AuthorizationKeysUpdate,
    AuthorizationKeysUpdateType,
    KeyUpdateEntryStatus,
    KeyWithStatus,
    PublicKeyExportFormat,
    UpdateType,
    VerifyKey,
} from '~/utils/types';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';
import { KeyUpdateEntry } from './KeyUpdateEntry';
import {
    mapCurrentAuthorizationsToUpdate,
    getAccessStructureTitle,
    keyIsInUse,
    getCurrentThresholds,
    removeRemovedKeys,
    reduceIndicesByOne,
} from './util';
import routes from '~/constants/routes.json';
import ProposeNewKey from './ProposeNewKey';
import AccessStructureThreshold from './AccessStructureThreshold';
import KeySetSize from './KeySetSize';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import SetExpiryAndEffectiveTime from './SetExpiryAndEffectiveTime';

import styles from '../../common/MultiSignatureFlowPage.module.scss';
import localStyles from './UpdateAuthorizationKeys.module.scss';

function getKeyUpdateType(protocolVersion: bigint, type: UpdateType) {
    if (type === UpdateType.UpdateLevel2KeysUsingRootKeys) {
        if (protocolVersion >= 9) {
            return AuthorizationKeysUpdateType.RootV2;
        }
        if (protocolVersion >= 4) {
            return AuthorizationKeysUpdateType.RootV1;
        }
        return AuthorizationKeysUpdateType.RootV0;
    }

    if (type === UpdateType.UpdateLevel2KeysUsingLevel1Keys) {
        if (protocolVersion >= 9) {
            return AuthorizationKeysUpdateType.Level1V2;
        }
        if (protocolVersion >= 4) {
            return AuthorizationKeysUpdateType.Level1V1;
        }
        return AuthorizationKeysUpdateType.Level1V0;
    }
    throw new Error('Invalid key update type.');
}

interface Props {
    defaults: FieldValues;
    chainParameters: ChainParameters;
    consensusStatus: ConsensusStatus;
    type: UpdateType;
    handleKeySubmit(
        effectiveTime: Date,
        expiryTime: Date,
        authorizationKeysUpdate: Partial<AuthorizationKeysUpdate>
    ): Promise<void>;
}

export default function UpdateAuthorizationKeys({
    defaults,
    chainParameters,
    consensusStatus,
    type,
    handleKeySubmit,
}: Props) {
    const allowEditingKeys = useRouteMatch({
        path: [
            routes.MULTISIGTRANSACTIONS_PROPOSAL_KEY_SET_SIZE,
            routes.MULTISIGTRANSACTIONS_PROPOSAL,
        ],
        exact: true,
    });

    const [error, setError] = useState<string>();

    const keyUpdateType = getKeyUpdateType(
        consensusStatus.protocolVersion,
        type
    );
    const currentKeys = chainParameters.level2Keys.keys;
    const currentKeySetSize = currentKeys.length;
    const currentAuthorizations = chainParameters.level2Keys;
    const currentAccessStructures = mapCurrentAuthorizationsToUpdate(
        keyUpdateType,
        currentAuthorizations
    ).accessStructures;
    const currentThresholds = getCurrentThresholds(currentAuthorizations); // TODO fix threshold when we have a default

    const [newLevel2Keys, setNewLevel2Keys] = useState<AuthorizationKeysUpdate>(
        defaults.keyUpdate ||
            mapCurrentAuthorizationsToUpdate(
                keyUpdateType,
                currentAuthorizations
            )
    );

    function setThreshold(
        accessStructureType: AccessStructureEnum,
        threshold: number
    ) {
        const updatedAccessStructures = newLevel2Keys.accessStructures.map(
            (accessStructure) => {
                if (accessStructure.type === accessStructureType) {
                    return {
                        ...accessStructure,
                        threshold,
                    };
                }
                return accessStructure;
            }
        );

        const updatedLevel2Keys: AuthorizationKeysUpdate = {
            ...newLevel2Keys,
            accessStructures: updatedAccessStructures,
        };
        setNewLevel2Keys(updatedLevel2Keys);
    }

    /**
     * A new key is always added to all access structures. This is done to
     * simplify the current implementation, not due to any requirements.
     */
    function addNewKey(publicKey: PublicKeyExportFormat) {
        let updatedKeys: VerifyKey[] = [...newLevel2Keys.keys, publicKey.key];
        let addedKeyIndex = updatedKeys.length - 1;

        // Find the key in the existing key set. If it already has an index,
        // then use that index to update the access structures. In that case
        // we don't have to add the key to the array of keys either.
        const existingKeyIndex = newLevel2Keys.keys.findIndex(
            (value) => value.verifyKey === publicKey.key.verifyKey
        );
        if (existingKeyIndex > -1) {
            addedKeyIndex = existingKeyIndex;
            updatedKeys = newLevel2Keys.keys;
        }

        const updatedAccessStructures = newLevel2Keys.accessStructures.map(
            (accessStructure) => {
                // If the key already exists in the access structure, then there is nothing to add.
                if (
                    accessStructure.publicKeyIndicies
                        .map((idx) => idx.index)
                        .includes(existingKeyIndex)
                ) {
                    return accessStructure;
                }

                const updatedAccessStructure: AccessStructure = {
                    ...accessStructure,
                    publicKeyIndicies: [
                        ...accessStructure.publicKeyIndicies,
                        {
                            index: addedKeyIndex,
                            status: KeyUpdateEntryStatus.Added,
                        },
                    ].sort((key1, key2) => key1.index - key2.index),
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

    /**
     * Returns a function that can update a provided key in the access
     * structure that was given as input.
     */
    function updateKey(accessStructure: AccessStructure) {
        return (keyToUpdate: KeyWithStatus) => {
            let removeAddedKey = false;
            const keyIndex = newLevel2Keys.keys.findIndex(
                (value) => value.verifyKey === keyToUpdate.key.verifyKey
            );

            let updatedAccessStructures = newLevel2Keys.accessStructures.map(
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

            // Check if the update resulted in any access structure only having
            // removed indices, as it is not valid to remove all keys for one
            // access structure. Display the error to the user.
            const acccessStructureWithNoIndices = updatedAccessStructures.find(
                (acs) => {
                    const notRemovedIndex = acs.publicKeyIndicies.find(
                        (index) => index.status !== KeyUpdateEntryStatus.Removed
                    );
                    if (!notRemovedIndex) {
                        return true;
                    }
                    return false;
                }
            );
            if (acccessStructureWithNoIndices) {
                setError(
                    'It is not allowed to remove all keys for a given parameter.'
                );
                return;
            }

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
                updatedAccessStructures = reduceIndicesByOne(
                    updatedAccessStructures,
                    keyIndex
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

    function displayAccessStructure(
        accessStructure: AccessStructure,
        keys: Key[]
    ) {
        return (
            <div key={accessStructure.type}>
                <h5 className="mB5">
                    {getAccessStructureTitle(accessStructure.type)}
                </h5>
                <div className="mono">
                    Current threshold:{' '}
                    <b>{currentThresholds.get(accessStructure.type)}</b>
                </div>
                <div className="mono">
                    New threshold: <b>{accessStructure.threshold}</b>
                </div>
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
                                updateKey={
                                    allowEditingKeys
                                        ? updateKey(accessStructure)
                                        : undefined
                                }
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

    function submitFunction(effectiveTime: Date, expiryTime: Date) {
        handleKeySubmit(effectiveTime, expiryTime, {
            ...newLevel2Keys,
            keyUpdateType,
        });
    }

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                content={error}
                onClick={() => setError(undefined)}
                header="Error"
            />
            <Columns
                divider
                columnScroll
                className={styles.subtractContainerPadding}
                columnClassName={styles.column}
            >
                <Columns.Column header="Transaction details">
                    <div className={styles.columnContent}>
                        <h5 className="mB5">Level 2 keys and their indices</h5>
                        <div className="mono">
                            Current size of level 2 key set:{' '}
                            <b>{currentKeySetSize}</b>
                        </div>
                        <div className="mono">
                            New size of level 2 key set:{' '}
                            <b>
                                {removeRemovedKeys(newLevel2Keys).keys.length}
                            </b>
                        </div>
                        <ul>
                            {removeRemovedKeys(newLevel2Keys).keys.map(
                                (key, index) => {
                                    return (
                                        <li
                                            className={localStyles.listItem}
                                            key={key.verifyKey}
                                        >
                                            <div className={localStyles.keyDiv}>
                                                <p
                                                    className={
                                                        localStyles.index
                                                    }
                                                >
                                                    {index}
                                                </p>
                                                <PublicKeyDetails
                                                    className={
                                                        localStyles.keyText
                                                    }
                                                    publicKey={key.verifyKey}
                                                />
                                            </div>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                        {newLevel2Keys.accessStructures.map(
                            (accessStructure) => {
                                return displayAccessStructure(
                                    accessStructure,
                                    newLevel2Keys.keys
                                );
                            }
                        )}
                    </div>
                </Columns.Column>
                <Columns.Column className={styles.stretchColumn} header={' '}>
                    <div className={styles.columnContent}>
                        <Switch>
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_PROPOSAL_SET_EFFECTIVE_EXPIRY
                                }
                                render={() => (
                                    <SetExpiryAndEffectiveTime
                                        defaults={defaults}
                                        onContinue={submitFunction}
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_PROPOSAL_KEY_SET_THRESHOLD
                                }
                                render={() => (
                                    <AccessStructureThreshold
                                        currentAccessStructures={
                                            currentAccessStructures
                                        }
                                        newAccessStructures={
                                            newLevel2Keys.accessStructures
                                        }
                                        currentThresholds={currentThresholds}
                                        setThreshold={setThreshold}
                                        type={type}
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_PROPOSAL_KEY_SET_SIZE
                                }
                                render={() => (
                                    <KeySetSize
                                        type={type}
                                        currentKeySetSize={currentKeySetSize}
                                        newKeySetSize={
                                            removeRemovedKeys(newLevel2Keys)
                                                .keys.length
                                        }
                                    />
                                )}
                            />
                            <Route
                                path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                                render={() => (
                                    <ProposeNewKey
                                        type={type}
                                        addKey={addNewKey}
                                    />
                                )}
                            />
                        </Switch>
                    </div>
                </Columns.Column>
            </Columns>
        </>
    );
}
