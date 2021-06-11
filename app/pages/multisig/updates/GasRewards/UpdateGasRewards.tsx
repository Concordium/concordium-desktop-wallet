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
export default function UpdateGasRewards({ defaults, blockSummary }: UpdateProps) {
    const currentRewards: GasRewards = useMemo(
        () => toRewardFractions(getCurrentValue(blockSummary)),
        [blockSummary]
    );

    const defaultRewards = {
        ...currentRewards,
        ...defaults
    }

    return (
        <>
            <GasRewardsForm
                title="Current GAS Reward Fractions"
                disabled
                gasRewards={currentRewards}
            />
            <GasRewardsForm
                title="New GAS Reward Fractions"
                gasRewards={defaultRewards}
            />
        </>
    );
}
