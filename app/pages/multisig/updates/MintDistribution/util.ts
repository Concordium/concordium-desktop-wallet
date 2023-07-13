import { isConsensusStatusV0 } from '@concordium/common-sdk/lib/versionedTypeHelpers';
import { ConsensusStatus, MintDistributionNode } from '~/node/NodeApiTypes';
import updateConstants from '~/constants/updateConstants.json';
import { RewardDistributionValue } from '../../common/RewardDistribution';

export const rewardDistributionLabels: [string, string, string] = [
    'Baking reward account',
    'Finalization account reward',
    'Foundation',
];

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
    if (isConsensusStatusV0(consensusStatus)) {
        const slotsPerSecond = 1000 / Number(consensusStatus.slotDuration);
        const slotsPerYear = slotsPerSecond * 60 * 60 * 24 * 365.25;
        return slotsPerYear;
    }
    // TODO how to calculate this?
    return 1;
};
