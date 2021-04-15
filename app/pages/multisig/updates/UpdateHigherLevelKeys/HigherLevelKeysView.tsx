import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { HigherLevelKeyUpdate, UpdateType } from '~/utils/types';
import {
    getKeySetSize,
    getThreshold,
    typeToDisplay,
} from '~/utils/updates/HigherLevelKeysHelpers';
import withBlockSummary, {
    WithBlockSummary,
} from '../../common/withBlockSummary';
import { generateStatusLabel } from './KeyUpdateEntry';
import styles from './HigherLevelKeysView.module.scss';

interface Props extends WithBlockSummary {
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

    const typeDisplayText = typeToDisplay(type);
    const currentThreshold = getThreshold(blockSummary.updates.keys, type);
    const currentKeySetSize = getKeySetSize(blockSummary.updates.keys, type);

    return (
        <>
            <div className={styles.content}>
                <h5>Signature threshold</h5>
                <p>
                    Current {typeDisplayText} key signature threshold:{' '}
                    <b>{currentThreshold}</b>
                </p>
                <p>
                    New {typeDisplayText} key signature threshold:{' '}
                    <b>{higherLevelKeyUpdate.threshold}</b>
                </p>
                <h5>Root governance key updates</h5>
                <p>
                    Current size of {typeDisplayText} key set:{' '}
                    <b>{currentKeySetSize}</b>
                </p>
                <p>
                    New size of {typeDisplayText} key set:{' '}
                    <b>{higherLevelKeyUpdate.updateKeys.length}</b>
                </p>
            </div>
            <ul>
                {higherLevelKeyUpdate.updateKeys.map((key) => {
                    return (
                        <li
                            className={styles.listItem}
                            key={key.verifyKey.verifyKey}
                        >
                            <p className={styles.keyText}>
                                {key.verifyKey.verifyKey}
                            </p>
                            {generateStatusLabel(key.status)}
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

export default withBlockSummary(HigherLevelKeysView);
