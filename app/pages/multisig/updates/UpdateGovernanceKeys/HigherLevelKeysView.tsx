import React from 'react';
import Loading from '~/cross-app-components/Loading';
import {
    HigherLevelKeyUpdate,
    KeyUpdateEntryStatus,
    UpdateType,
} from '~/utils/types';
import {
    getKeySetSize,
    getThreshold,
    typeToDisplay,
} from '~/utils/updates/HigherLevelKeysHelpers';
import withChainData, { ChainData } from '../../common/withChainData';
import { generateStatusLabel } from './KeyUpdateEntry';
import styles from './HigherLevelKeysView.module.scss';

interface Props extends ChainData {
    higherLevelKeyUpdate: HigherLevelKeyUpdate;
    type: UpdateType;
}

/**
 * Displays an overview of a higher level key update.
 *
 * Currently it also shows the existing threshold and key set sizes on chain,
 * but this could be removed if it should not depend on the block summary.
 */
function HigherLevelKeysView({
    higherLevelKeyUpdate,
    type,
    blockSummary,
}: Props) {
    if (!blockSummary) {
        return <Loading inline />;
    }

    const currentThreshold = getThreshold(blockSummary.updates.keys, type);
    const currentKeySetSize = getKeySetSize(blockSummary.updates.keys, type);
    const newKeySetSize = higherLevelKeyUpdate.updateKeys.filter(
        (key) => key.status !== KeyUpdateEntryStatus.Removed
    ).length;

    return (
        <>
            <div className={styles.content}>
                <h5 className="mB5">Signature threshold:</h5>
                <div className="mono">
                    Current {typeToDisplay(type)} key signature threshold:{' '}
                    <b>{currentThreshold}</b>
                </div>
                <div className="mono">
                    New {typeToDisplay(type)} key signature threshold:{' '}
                    <b>{higherLevelKeyUpdate.threshold}</b>
                </div>
                <h5 className="mB5">
                    {typeToDisplay(type)} governance key updates:
                </h5>
                <div className="mono">
                    Current size of {typeToDisplay(type)} key set:{' '}
                    <b>{currentKeySetSize}</b>
                </div>
                <div className="mono">
                    New size of {typeToDisplay(type)} key set:{' '}
                    <b>{newKeySetSize}</b>
                </div>
            </div>
            <ul>
                {higherLevelKeyUpdate.updateKeys.map((key) => {
                    return (
                        <li className={styles.listItem} key={key.key.verifyKey}>
                            {generateStatusLabel(key.status)}
                            <p className={styles.keyText}>
                                {key.key.verifyKey}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

export default withChainData(HigherLevelKeysView);
