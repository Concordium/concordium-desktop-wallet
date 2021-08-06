import { RewardFraction } from '../utils/types';

// The node returns the mint per slot value as a scientific notation String,
// which does not match the serialization format entirely. Therefore
// this interface is required.
export interface MintDistributionNode {
    mintPerSlot: number;
    bakingReward: RewardFraction;
    finalizationReward: RewardFraction;
}

export interface MintEvent {
    tag: string;
    foundationAccount: string;
    mintPlatformDevleopmentCharge: number;
    mintFinalizationReward: number;
    mintBakingReward: number;
}

export interface BirkParametersBaker {
    bakerAccount: string;
    bakerId: number;
    bakerLotteryPower: number;
}

export interface BirkParametersInfo {
    bakers: BirkParametersBaker[];
    electionDifficulty: number;
    electionNonce: string;
}
