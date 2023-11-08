import { ChainParameters } from '~/node/NodeApiTypes';
import updateConstants from '~/constants/updateConstants.json';
import { RewardDistributionValue } from '../../common/RewardDistribution';

export const rewardDistributionLabels: [string, string, string] = [
    'Baker reward',
    'Next gas account',
    'Foundation',
];

export const getCurrentValue = (
    chainParameters: ChainParameters
): RewardDistributionValue => ({
    first:
        chainParameters.rewardParameters.transactionFeeDistribution.baker *
        updateConstants.rewardFractionResolution,
    second:
        chainParameters.rewardParameters.transactionFeeDistribution.gasAccount *
        updateConstants.rewardFractionResolution,
});
