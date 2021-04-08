import React from 'react';
import { HigherLevelKeyUpdate } from '~/utils/types';
import withBlockSummary, {
    WithBlockSummary,
} from '../../common/withBlockSummary';

interface Props extends WithBlockSummary {
    higherLevelKeyUpdate: HigherLevelKeyUpdate;
}

/**
 * Displays an overview of a higher level key update. In particular it also
 * uses the current on-chain authorization keys to generate the view, so that
 * what the user is presented works as a sort of diff between the existing keys
 * and what is going to be changed.
 */
function HigherLevelKeysView({ higherLevelKeyUpdate }: Props) {
    // TODO Get block summary as input, so that we can make the view correctly.

    return (
        <>
            <div>
                <h5>Current higher level keys</h5>
                Extract the current keys from the block summary.
                {higherLevelKeyUpdate.threshold}
            </div>
            <div>
                <h5>Used for new, but we have to make them interact.</h5>
            </div>
        </>
    );
}

export default withBlockSummary(HigherLevelKeysView);
