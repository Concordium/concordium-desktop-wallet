import { BlockSummary, ConsensusStatus } from '~/utils/NodeApiTypes';

export const getCurrentValue = (blockSummary: BlockSummary) =>
    blockSummary.updates.chainParameters.rewardParameters.mintDistribution;

export const getSlotsPerYear = (consensusStatus: ConsensusStatus): number => {
    const slotsPerSecond = 1000 / consensusStatus.slotDuration;
    const slotsPerYear = slotsPerSecond * 60 * 60 * 24 * 365.25;
    return slotsPerYear;
};
