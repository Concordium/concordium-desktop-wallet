import React, { useState } from 'react';
import { Route, Switch } from 'react-router';
import Columns from '~/components/Columns';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { UpdateComponent } from '~/utils/transactionTypes';
import routes from '~/constants/routes.json';
import styles from '../common/MultiSignatureFlowPage.module.scss';
import ProposeNewKey from './UpdateHigherLevelKeys/ProposeNewKey';
import KeySetSize from './UpdateHigherLevelKeys/KeySetSize';
import { HigherLevelKeyUpdate, UpdateType, VerifyKey } from '~/utils/types';
import { PublicKeyExportFormat } from '../ExportKeyView/ExportKeyView';
import KeySetThreshold from './UpdateHigherLevelKeys/KeySetThreshold';
import InputTimestamp from '~/components/Form/InputTimestamp';
import { getNow, TimeConstants } from '~/utils/timeHelpers';

interface Props {
    blockSummary: BlockSummary;
    UpdateComponentInput: UpdateComponent;
    type: UpdateType;
    handleKeySubmit(
        effectiveTime: Date,
        higherLevelKeyUpdate: HigherLevelKeyUpdate
    ): Promise<void>;
}

/**
 * Component used for the subset of update instructions that are used to update the
 * authorization key sets.
 */
export default function CreateKeyUpdateProposal({
    blockSummary,
    UpdateComponentInput,
    type,
    handleKeySubmit,
}: Props) {
    const { keys } = blockSummary.updates.keys.rootKeys;
    const currentKeySetSize = keys.length;
    const currentThreshold = blockSummary.updates.keys.rootKeys.threshold;

    const [newKeys, setNewKeys] = useState<VerifyKey[]>(keys);
    const [threshold, setThreshold] = useState<number>(currentThreshold);
    const [effectiveTime, setEffectiveTime] = useState<Date | undefined>(
        new Date(getNow() + 5 * TimeConstants.Minute)
    );

    function addNewKey(publicKey: PublicKeyExportFormat) {
        // TODO Fix the format so that it matches with verify key directly, instead of having it split up.
        const newVerifyKey: VerifyKey = {
            verifyKey: publicKey.verifyKey,
            schemeId: publicKey.schemeId,
        };

        const updatedKeys = [...newKeys, newVerifyKey];
        setNewKeys(updatedKeys);
    }

    function submitFunctionTest() {
        if (!effectiveTime) {
            return;
        }
        const higherLevelKeyUpdate: HigherLevelKeyUpdate = {
            // TODO Make dynamic, 0 for root, 1 for using level 1
            keyUpdateType: 0,
            threshold,
            updateKeys: newKeys,
        };

        handleKeySubmit(effectiveTime, higherLevelKeyUpdate);
    }

    return (
        <Columns divider columnScroll columnClassName={styles.column}>
            <Columns.Column header="Transaction Details">
                <div className={styles.columnContent}>
                    {threshold}
                    {blockSummary && (
                        <UpdateComponentInput blockSummary={blockSummary} />
                    )}
                    <InputTimestamp
                        value={effectiveTime}
                        onChange={setEffectiveTime}
                    />
                </div>
            </Columns.Column>
            <Columns.Column className={styles.stretchColumn}>
                <div className={styles.columnContent}>
                    <Switch>
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_PROPOSAL_KEY_SET_THRESHOLD
                            }
                            render={() => (
                                <KeySetThreshold
                                    type={type}
                                    currentThreshold={currentThreshold}
                                    setThreshold={setThreshold}
                                    submitFunctionTest={submitFunctionTest}
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
                                    newKeySetSize={newKeys.length}
                                />
                            )}
                        />
                        <Route
                            path={routes.MULTISIGTRANSACTIONS_PROPOSAL}
                            render={() => (
                                <ProposeNewKey type={type} addKey={addNewKey} />
                            )}
                        />
                    </Switch>
                </div>
            </Columns.Column>
        </Columns>
    );
}
