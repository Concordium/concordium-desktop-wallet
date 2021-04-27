import React, { useMemo } from 'react';
import { GasRewards } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import GasRewardsForm from './GasRewardsForm';
import { getCurrentValue, toRewardFractions } from './util';

export type { UpdateGasRewardsFields } from './GasRewardsForm';

/**
 * The component used for creating an update transaction for updating the
 * GAS rewards chain parameters.
 */
export default function UpdateGasRewards({ blockSummary }: UpdateProps) {
    const currentRewards: GasRewards = useMemo(
        () => toRewardFractions(getCurrentValue(blockSummary)),
        [blockSummary]
    );

    return (
        <>
            <GasRewardsForm
                title="Current GAS rewards"
                disabled
                gasRewards={currentRewards}
            />
            <GasRewardsForm
                title="New GAS rewards"
                gasRewards={currentRewards}
            />
        </>
    );
}
