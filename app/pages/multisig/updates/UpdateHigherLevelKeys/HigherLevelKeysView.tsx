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
import { generateStatusLabelText } from './KeyUpdateEntry';
import styles from './HigherLevelKeysView.module.scss';

interface Props extends WithBlockSummary {
    higherLevelKeyUpdate: HigherLevelKeyUpdate;
    type: UpdateType;
}

/**
 * Displays an overview of a higher level key update. Currently it also
 * shows the existing threshold and key set sizes on chain, but this could
 * be removed if it should not depend on the block summary.
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
            <h5>{typeDisplayText} governance key signature threshold</h5>
            <p>
                Current signature threshold: <b>{currentThreshold}</b>
            </p>
            <p>
                New signature threshold: <b>{higherLevelKeyUpdate.threshold}</b>
            </p>

            <h5>{typeDisplayText} governance amount of keys</h5>
            <p>
                Current size of key set: <b>{currentKeySetSize}</b>
            </p>
            <p>
                New size of key set:
                <b>{higherLevelKeyUpdate.updateKeys.length}</b>
            </p>

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
                            <h2>{generateStatusLabelText(key.status)}</h2>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

export default withBlockSummary(HigherLevelKeysView);
