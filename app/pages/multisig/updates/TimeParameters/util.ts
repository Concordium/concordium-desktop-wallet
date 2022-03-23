import { BlockSummaryV1 } from '@concordium/node-sdk';
import { ConsensusStatus } from '~/node/NodeApiTypes';

export const getCurrentValue = (blockSummary: BlockSummaryV1) =>
    blockSummary.updates.chainParameters;

export const getPaydaysPerYear = (
    rewardPeriodLength: bigint,
    consensusStatus: ConsensusStatus
): number => {
    const epochsPerSecond = 1000 / Number(consensusStatus.epochDuration);
    const epochsPerYear = epochsPerSecond * 60 * 60 * 24 * 365.25;
    return epochsPerYear / Number(rewardPeriodLength); // TODO don't change bigint to number
};
