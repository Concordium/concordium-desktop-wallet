import { Authorizations } from '@concordium/node-sdk/';
import { RewardFraction, VerifyKey } from '../utils/types';

export {
    BlockSummary,
    ConsensusStatus,
    Authorizations,
} from '@concordium/node-sdk/';

// This file contains interfaces that matches what is returned
// from the Concordium Node using GRPC.

export interface Authorization {
    threshold: number;
    authorizedKeys: number[];
}

export interface Key {
    verifyKey: string;
    schemeId: string;
}

// The node returns the mint per slot value as a scientific notation String,
// which does not match the serialization format entirely. Therefore
// this interface is required.
export interface MintDistributionNode {
    mintPerSlot: number;
    bakingReward: RewardFraction;
    finalizationReward: RewardFraction;
}

export interface KeysWithThreshold {
    keys: VerifyKey[];
    threshold: number;
}

export interface Keys {
    rootKeys: KeysWithThreshold;
    level1Keys: KeysWithThreshold;
    level2Keys: Authorizations;
}

export interface AccountNonce {
    nonce: string;
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
