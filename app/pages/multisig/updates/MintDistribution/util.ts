import {
    BlockSummary,
    ConsensusStatus,
    MintDistributionNode,
} from '~/node/NodeApiTypes';
import updateConstants from '~/constants/updateConstants.json';
import { RewardDistributionValue } from '../../common/RewardDistribution';

export const rewardDistributionLabels: [string, string, string] = [
    'Baking reward account',
    'Finalization account reward',
    'Foundation',
];

export const getCurrentValue = (blockSummary: BlockSummary) =>
    blockSummary.updates.chainParameters.rewardParameters.mintDistribution;

export const toRewardDistributionValue = ({
    bakingReward,
    finalizationReward,
}: Pick<
    MintDistributionNode,
    'bakingReward' | 'finalizationReward'
>): RewardDistributionValue => ({
    first: bakingReward * updateConstants.rewardFractionResolution,
    second: finalizationReward * updateConstants.rewardFractionResolution,
});

export const getSlotsPerYear = (consensusStatus: ConsensusStatus): number => {
    const slotsPerSecond = 1000 / Number(consensusStatus.slotDuration);
    const slotsPerYear = slotsPerSecond * 60 * 60 * 24 * 365.25;
    return slotsPerYear;
};
