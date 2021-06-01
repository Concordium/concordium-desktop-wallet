import React, { useCallback, useState } from 'react';
import { Route, Switch } from 'react-router';
import Columns from '~/components/Columns';
import { BlockSummary, KeysWithThreshold } from '~/node/NodeApiTypes';
import routes from '~/constants/routes.json';
import styles from '../../common/MultiSignatureFlowPage.module.scss';
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
import InputTimestamp from '~/components/Form/InputTimestamp';
import {
    getDefaultExpiry,
    getFormattedDateString,
    subtractHours,
    TimeConstants,
} from '~/utils/timeHelpers';
import KeyUpdateEntry from './KeyUpdateEntry';
import { typeToDisplay } from '~/utils/updates/HigherLevelKeysHelpers';
import { useTransactionExpiryState } from '~/utils/dataHooks';

interface Props {
    blockSummary: BlockSummary;
    type: UpdateType;
    handleKeySubmit(
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
    blockSummary: BlockSummary
): KeysWithThreshold {
    switch (type) {
        case UpdateType.UpdateRootKeys:
            return blockSummary.updates.keys.rootKeys;
        case UpdateType.UpdateLevel1KeysUsingRootKeys:
            return blockSummary.updates.keys.level1Keys;
        case UpdateType.UpdateLevel1KeysUsingLevel1Keys:
            return blockSummary.updates.keys.level1Keys;
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
    blockSummary,
    type,
    handleKeySubmit,
}: Props) {
    // Current values on the blockchain received from the node.
    const currentKeysWithThreshold = getCurrentKeysWithThreshold(
        type,
        blockSummary
    );
    const currentKeys = currentKeysWithThreshold.keys;
    const currentKeySetSize = currentKeys.length;
    const currentThreshold = currentKeysWithThreshold.threshold;

    // The values for the transaction proposal, i.e. the updated key set and threshold.
    const [newKeys, setNewKeys] = useState<KeyWithStatus[]>(
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

    const [threshold, setThreshold] = useState<number>(currentThreshold);
    const [effectiveTime, setEffectiveTime] = useState<Date | undefined>(
        new Date(getDefaultExpiry().getTime() + 5 * TimeConstants.Minute)
    );

    const checkIsBeforeEffective = useCallback(
        (expiry: Date | undefined) => {
            if (expiry === undefined) {
                return undefined;
            }
            if (effectiveTime !== undefined && effectiveTime < expiry) {
                return 'Expiry must be before the effective time';
            }
            return undefined;
        },
        [effectiveTime]
    );

    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState(checkIsBeforeEffective);

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

    function submitFunction() {
        if (!effectiveTime) {
            return;
        }
        if (!expiryTime) {
            return;
        }
        const higherLevelKeyUpdate: Partial<HigherLevelKeyUpdate> = {
            threshold,
            updateKeys: newKeys,
        };

        handleKeySubmit(effectiveTime, expiryTime, higherLevelKeyUpdate);
    }

    return (
        <Columns divider columnScroll columnClassName={styles.column}>
            <Columns.Column header="Transaction Details">
                <div className={styles.columnContent}>
                    <h5>Signature threshold</h5>
                    <p>
                        Current {typeToDisplay(type)} key signature threshold:{' '}
                        <b>{currentThreshold}</b>
                    </p>
                    <p>
                        New {typeToDisplay(type)} key signature threshold:{' '}
                        <b>{threshold}</b>
                    </p>
                    <h5>{typeToDisplay(type)} governance key updates</h5>
                    <p>
                        Current size of {typeToDisplay(type)} key set:{' '}
                        <b>{currentKeySetSize}</b>
                    </p>
                    <p>
                        New size of {typeToDisplay(type)} key set:{' '}
                        <b>{newKeySetSize}</b>
                    </p>
                    <ul>
                        {newKeys.map((keyWithStatus) => {
                            return (
                                <KeyUpdateEntry
                                    key={keyWithStatus.key.verifyKey}
                                    updateKey={updateKey}
                                    keyInput={keyWithStatus}
                                />
                            );
                        })}
                    </ul>
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
                                <KeySetThreshold
                                    type={type}
                                    maxThreshold={newKeySetSize}
                                    currentThreshold={currentThreshold}
                                    setThreshold={setThreshold}
                                    submitFunction={submitFunction}
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
                                    newKeys={newKeys}
                                />
                            )}
                        />
                    </Switch>
                </div>
            </Columns.Column>
        </Columns>
    );
}
