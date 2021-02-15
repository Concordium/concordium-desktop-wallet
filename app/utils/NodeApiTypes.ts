import { ExchangeRate, TransactionFeeDistribution } from './types';

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
}

interface RewardParameters {
    transactionFeeDistribution: TransactionFeeDistribution;
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
