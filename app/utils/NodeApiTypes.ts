import {
    ExchangeRate,
    GasRewards,
    RewardFraction,
    TransactionFeeDistribution,
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
    lastFinalizedBlock: string;
}

interface UpdateQueue {
    nextSequenceNumber: BigInt;
    queue: unknown; // FIXME: add the actual type
}

interface UpdateQueues {
    microGTUPerEuro: UpdateQueue;
    euroPerEnergy: UpdateQueue;
    transactionFeeDistribution: UpdateQueue;
    foundationAccount: UpdateQueue;
    mintDistribution: UpdateQueue;
    gasRewards: UpdateQueue;
}

interface Authorization {
    threshold: number;
    authorizedKeys: number[];
}

interface Authorizations {
    microGTUPerEuro: Authorization;
    euroPerEnergy: Authorization;
    transactionFeeDistribution: Authorization;
    foundationAccount: Authorization;
    mintDistribution: Authorization;
    paramGASRewards: Authorization;
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
}

interface Updates {
    authorizations: Authorizations;
    chainParameters: ChainParameters;
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
