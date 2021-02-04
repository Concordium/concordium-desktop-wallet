import { ExchangeRate } from './types';

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
    queue;
}

interface UpdateQueues {
    microGTUPerEuro: UpdateQueue;
}

interface Authorization {
    threshold: number;
    authorizedKeys: number[];
}

interface Authorizations {
    microGTUPerEuro: Authorization;
}

interface ChainParameters {
    microGTUPerEuro: ExchangeRate;
    euroPerEnergy: ExchangeRate;
}

interface Updates {
    authorizations: Authorizations;
    chainParameters: ChainParameters;
    updateQueues: UpdateQueues;
}

export interface BlockSummary {
    updates: Updates;
}
