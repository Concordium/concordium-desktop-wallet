import {
    ExchangeRate,
    GasRewards,
    RewardFraction,
    TransactionFeeDistribution,
    VerifyKey,
} from './types';

// This file contains interfaces that matches what is returned
// from the Concordium Node using GRPC.

/**
 * Model that matches what is returned by the node when getting the
 * current consensus status.
 * Currently only the fields required by existing functionality has been
 * added. If additional fields are required, then extend the interface.
 */
export interface ConsensusStatus {
    slotDuration: number;
    lastFinalizedBlock: string;
}

interface UpdateQueue {
    nextSequenceNumber: bigint;
    queue: unknown; // FIXME: add the actual type
}

interface UpdateQueues {
    microGTUPerEuro: UpdateQueue;
    euroPerEnergy: UpdateQueue;
    transactionFeeDistribution: UpdateQueue;
    foundationAccount: UpdateQueue;
    electionDifficulty: UpdateQueue;
    mintDistribution: UpdateQueue;
    protocol: UpdateQueue;
    gasRewards: UpdateQueue;
    bakerStakeThreshold: UpdateQueue;
}

export interface Authorization {
    threshold: number;
    authorizedKeys: number[];
}

export interface Key {
    verifyKey: string;
    schemeId: string;
}

export interface Authorizations {
    microGTUPerEuro: Authorization;
    euroPerEnergy: Authorization;
    transactionFeeDistribution: Authorization;
    foundationAccount: Authorization;
    mintDistribution: Authorization;
    protocol: Authorization;
    paramGASRewards: Authorization;
    bakerStakeThreshold: Authorization;
    electionDifficulty: Authorization;
    keys: Key[];
}

// The node returns the mint per slot value as a scientific notation String,
// which does not match the serialization format entirely. Therefore
// this interface is required.
interface MintDistributionNode {
    mintPerSlot: string;
    bakingReward: RewardFraction;
    finalizationReward: RewardFraction;
}

interface RewardParameters {
    transactionFeeDistribution: TransactionFeeDistribution;
    mintDistribution: MintDistributionNode;
    gASRewards: GasRewards;
}

interface ChainParameters {
    microGTUPerEuro: ExchangeRate;
    euroPerEnergy: ExchangeRate;
    rewardParameters: RewardParameters;
    minimumThresholdForBaking: bigint;
    electionDifficulty: number;
}

interface KeysWithThreshold {
    keys: VerifyKey[];
    threshold: number;
}

export interface Keys {
    rootKeys: KeysWithThreshold;
    level1Keys: KeysWithThreshold;
    level2Keys: Authorizations;
}

interface Updates {
    chainParameters: ChainParameters;
    keys: Keys;
    updateQueues: UpdateQueues;
}

interface MintEvent {
    tag: string;
    foundationAccount: string;
    mintPlatformDevleopmentCharge: number;
    mintFinalizationReward: number;
    mintBakingReward: number;
}

export interface BlockSummary {
    updates: Updates;
    specialEvents: [MintEvent];
}

export interface AccountNonce {
    nonce: string;
}
