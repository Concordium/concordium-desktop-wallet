import { BlockSummary } from '~/node/NodeApiTypes';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import { RewardDistributionValue } from '../../common/RewardDistribution';

/* eslint-disable import/prefer-default-export */
export const rewardDistributionLabels: [string, string, string] = [
    'Baker reward',
    'Next gas account',
    'Foundation',
];

export const getCurrentValue = (
    blockSummary: BlockSummary
): RewardDistributionValue => ({
    first:
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.baker * rewardFractionResolution,
    second:
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.gasAccount * rewardFractionResolution,
});
