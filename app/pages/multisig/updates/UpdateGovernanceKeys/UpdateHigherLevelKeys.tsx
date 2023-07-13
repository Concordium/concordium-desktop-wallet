import React, { useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { FieldValues } from 'react-hook-form';
import Columns from '~/components/Columns';
import { ChainParameters, KeysWithThreshold } from '~/node/NodeApiTypes';
import routes from '~/constants/routes.json';
import ProposeNewKey from './ProposeNewKey';
import KeySetSize from './KeySetSize';
import {
    HigherLevelKeyUpdate,
    KeyUpdateEntryStatus,
    KeyWithStatus,
    PublicKeyExportFormat,
    UpdateType,
} from '~/utils/types';
import KeySetThreshold from './KeySetThreshold';
import { KeyUpdateEntry } from './KeyUpdateEntry';
import { typeToDisplay } from '~/utils/updates/HigherLevelKeysHelpers';
import SetExpiryAndEffectiveTime from './SetExpiryAndEffectiveTime';

import styles from '../../common/MultiSignatureFlowPage.module.scss';

interface Props {
    defaults: FieldValues;
    chainParameters: ChainParameters;
    type: UpdateType;
    handleHigherLevelKeySubmit(
        effectiveTime: Date,
        expiryTime: Date,
        higherLevelKeyUpdate: Partial<HigherLevelKeyUpdate>
    ): Promise<void>;
}

/**
 * Returns the key set that matches the update type, i.e. the key set
 * that is updated by the given update type.
 */
function getCurrentKeysWithThreshold(
    type: UpdateType,
    chainParameters: ChainParameters
): KeysWithThreshold {
    switch (type) {
        case UpdateType.UpdateRootKeys:
            return chainParameters.rootKeys;
        case UpdateType.UpdateLevel1KeysUsingRootKeys:
            return chainParameters.level1Keys;
        case UpdateType.UpdateLevel1KeysUsingLevel1Keys:
            return chainParameters.level1Keys;
        default:
            throw new Error(
                `An update type that was not a higher level key update was received: ${type}`
            );
    }
}

/**
 * Component used for the subset of update instructions that are used to update the
 * higher level key sets (root keys and level 1 keys).
 */
export default function UpdateHigherLevelKeys({
    defaults,
    chainParameters,
    type,
    handleHigherLevelKeySubmit,
}: Props) {
    const allowEditingKeys = useRouteMatch({
        path: [
            routes.MULTISIGTRANSACTIONS_PROPOSAL_KEY_SET_SIZE,
            routes.MULTISIGTRANSACTIONS_PROPOSAL,
        ],
        exact: true,
    });
    // Current values on the blockchain received from the node.
    const currentKeysWithThreshold = getCurrentKeysWithThreshold(
        type,
        chainParameters
    );
    const currentKeys = currentKeysWithThreshold.keys;
    const currentKeySetSize = currentKeys.length;
    const currentThreshold = currentKeysWithThreshold.threshold;

    // The values for the transaction proposal, i.e. the updated key set and threshold.
    const [newKeys, setNewKeys] = useState<KeyWithStatus[]>(
        defaults.keyUpdate?.updateKeys ||
            currentKeys.map((key) => {
                return {
                    key,
                    status: KeyUpdateEntryStatus.Unchanged,
                };
            })
    );
    const newKeySetSize = newKeys.filter(
        (key) => key.status !== KeyUpdateEntryStatus.Removed
    ).length;

    const [threshold, setThreshold] = useState<number>(
        defaults.keyUpdate?.threshold || currentThreshold
    );

    function addNewKey(publicKey: PublicKeyExportFormat) {
        const addedKey = {
            ...publicKey,
            status: KeyUpdateEntryStatus.Added,
        };

        const updatedKeys = [...newKeys, addedKey];
        setNewKeys(updatedKeys);
    }

    /**
     * Updates the state with the supplied key. The key should already
     * be present in the state for any changes to be made.
     */
    function updateKey(keyToUpdate: KeyWithStatus) {
        let removeAddedKey = false;
        const updatedKeys = newKeys
            .map((key) => {
                if (keyToUpdate.key.verifyKey === key.key.verifyKey) {
                    // For the special case where the key was not in the current key set, i.e. it was added,
                    // then we remove it entirely if set to removed instead of just updating the status.
                    if (
                        key.status === KeyUpdateEntryStatus.Added &&
                        keyToUpdate.status === KeyUpdateEntryStatus.Removed
                    ) {
                        removeAddedKey = true;
                    }

                    return keyToUpdate;
                }
                return key;
            })
            .filter(
                (key) =>
                    !(
                        removeAddedKey &&
                        keyToUpdate.key.verifyKey === key.key.verifyKey
                    )
            );
        setNewKeys(updatedKeys);
    }

    function submitFunction(effectiveTime: Date, expiryTime: Date) {
        const higherLevelKeyUpdate: Partial<HigherLevelKeyUpdate> = {
            threshold,
            updateKeys: newKeys,
        };

        handleHigherLevelKeySubmit(
            effectiveTime,
            expiryTime,
            higherLevelKeyUpdate
        );
    }

    return (
        <Columns
            divider
            columnScroll
            className={styles.subtractContainerPadding}
            columnClassName={styles.column}
        >
            <Columns.Column header="Transaction details">
                <div className={styles.columnContent}>
                    <h5 className="mB5">Signature threshold</h5>
                    <div className="mono">
                        Current {typeToDisplay(type)} key signature threshold:{' '}
                        <b>{currentThreshold}</b>
                    </div>
                    <div className="mono">
                        New {typeToDisplay(type)} key signature threshold:{' '}
                        <b>{threshold}</b>
                    </div>
                    <h5 className="mB5">
                        {typeToDisplay(type)} governance key updates
                    </h5>
                    <div className="mono">
                        Current size of {typeToDisplay(type)} key set:{' '}
                        <b>{currentKeySetSize}</b>
                    </div>
                    <div className="mono">
                        New size of {typeToDisplay(type)} key set:{' '}
                        <b>{newKeySetSize}</b>
                    </div>
                    <ul className="mT10">
                        {newKeys.map((keyWithStatus) => {
                            return (
                                <KeyUpdateEntry
                                    key={keyWithStatus.key.verifyKey}
                                    updateKey={
                                        allowEditingKeys ? updateKey : undefined
                                    }
                                    keyInput={keyWithStatus}
                                />
                            );
                        })}
                    </ul>
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
                                <KeySetThreshold
                                    type={type}
                                    maxThreshold={newKeySetSize}
                                    currentThreshold={currentThreshold}
                                    defaultThreshold={threshold}
                                    setThreshold={setThreshold}
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
                                    newKeySetSize={newKeySetSize}
                                />
                            )}
                        />
                        <Route
                            path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                            render={() => (
                                <ProposeNewKey
                                    type={type}
                                    addKey={addNewKey}
                                    newKeys={newKeys.map((key) => key.key)}
                                />
                            )}
                        />
                    </Switch>
                </div>
            </Columns.Column>
        </Columns>
    );
}
