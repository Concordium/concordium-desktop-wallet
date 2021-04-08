import React from 'react';

import { UpdateProps } from '~/utils/transactionTypes';

export default function UpdateHigherLevelKeys({ blockSummary }: UpdateProps) {
    // TODO Get current authorization keys
    // const currentValue: RewardDistributionValue = getCurrentValue(blockSummary);

    // TODO Fix this value to be using the blocksummary for what we need. This is just a placeholder.
    const currentVal = blockSummary.updates.authorizations.bakerStakeThreshold;

    return (
        <>
            <div>
                <h5>Root governance key updates</h5>
                {currentVal}
                <p>Current size of root keyset: 4</p>
                <p>New size of root keyset: 3</p>
                <p>INSERT COMPONENT FOR HANDLING THE KEY ADDITIONS/REMOVALS</p>
            </div>
        </>
    );
}
