import { ChainParameters } from '~/node/NodeApiTypes';
import updateConstants from '~/constants/updateConstants.json';
import { RewardDistributionValue } from '../../common/RewardDistribution';

/* eslint-disable import/prefer-default-export */
export const rewardDistributionLabels: [string, string, string] = [
    // TODO should this have been translated from 'Baker reward'?
    'Validator reward',
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
