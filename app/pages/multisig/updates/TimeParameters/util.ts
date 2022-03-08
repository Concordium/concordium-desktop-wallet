import { BlockSummaryV1 } from '@concordium/node-sdk';
import { ConsensusStatus, MintDistributionNode } from '~/node/NodeApiTypes';
import updateConstants from '~/constants/updateConstants.json';
import { RewardDistributionValue } from '../../common/RewardDistribution';

export const rewardDistributionLabels: [string, string, string] = [
    'Baking reward account',
    'Finalization account reward',
    'Foundation',
];

export const getCurrentValue = (blockSummary: BlockSummaryV1) =>
    blockSummary.updates.chainParameters;

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

export const getPaydaysPerYear = (
    rewardPeriodLength: bigint,
    consensusStatus: ConsensusStatus
): number => {
    const epochsPerSecond = 1000 / Number(consensusStatus.epochDuration);
    const epochsPerYear = epochsPerSecond * 60 * 60 * 24 * 365.25;
    return Math.floor(epochsPerYear / Number(rewardPeriodLength)); // TODO don't change bigint to number
};
