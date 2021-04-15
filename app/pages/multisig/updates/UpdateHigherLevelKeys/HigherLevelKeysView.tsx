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
import KeyUpdateEntry, { KeyUpdateEntryStatus } from './KeyUpdateEntry';

interface Props extends WithBlockSummary {
    higherLevelKeyUpdate: HigherLevelKeyUpdate;
    type: UpdateType;
}

/**
 * Displays an overview of a higher level key update. In particular it also
 * uses the current on-chain authorization keys to generate the view, so that
 * what the user is presented works as a sort of diff between the existing keys
 * and what is going to be changed.
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
                        <KeyUpdateEntry
                            key={key.verifyKey}
                            status={KeyUpdateEntryStatus.Unchanged}
                            verifyKey={key}
                        />
                    );
                })}
            </ul>
        </>
    );
}

export default withBlockSummary(HigherLevelKeysView);
