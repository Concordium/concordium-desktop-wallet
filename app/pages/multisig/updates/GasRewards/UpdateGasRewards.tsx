import React, { useMemo } from 'react';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import { GasRewards } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import GasRewardsForm from './GasRewardsForm';

export type { UpdateGasRewardsFields } from './GasRewardsForm';

/**
 * The component used for creating an update transaction for updating the
 * GAS rewards chain parameters.
 */
export default function UpdateGasRewards({ blockSummary }: UpdateProps) {
    const currentRewards: GasRewards = useMemo(
        () => ({
            baker:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .baker * rewardFractionResolution,
            finalizationProof:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .finalizationProof * rewardFractionResolution,
            accountCreation:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .accountCreation * rewardFractionResolution,
            chainUpdate:
                blockSummary.updates.chainParameters.rewardParameters.gASRewards
                    .chainUpdate * rewardFractionResolution,
        }),
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
