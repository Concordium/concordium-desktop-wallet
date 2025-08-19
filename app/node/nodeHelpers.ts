import {
    getConsensusStatus,
    getAccountInfo,
    getCryptographicParameters,
    getBlockChainParameters,
    getIdentityProviders,
    getAnonymityRevokers,
    getPoolInfo,
    getRewardStatus,
} from './nodeRequests';
import { AccountInfo, Global, Fraction } from '../utils/types';

export async function getlastFinalizedBlockHash(): Promise<string> {
    const consensusStatus = await getConsensusStatus();
    return consensusStatus.lastFinalizedBlock.toString();
}

/**
 * Gets the accountInfo for the given address.
 * Throws an error, if the node doesn't return an accountInfo object.
 */
export async function getAccountInfoOfAddress(
    address: string
): Promise<AccountInfo> {
    const accountInfo = await getAccountInfo(address);
    if (!accountInfo) {
        throw new Error(
            `Address ${address} does not represent an account on the connected node. Please check that your node is up to date with the blockchain.`
        );
    }
    return accountInfo;
}

/**
 * Takes a function expecting a blockHash as the first argument, and returns a new function with the hash of the last block applied to it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyLastBlockHash = <A extends any[], R>(
    fun: (hash: string, ...args: A) => Promise<R>
): ((...args: A) => Promise<R>) => async (...args) =>
    fun(await getlastFinalizedBlockHash(), ...args);

/**
 * Gets reward status object from newest block.
 *
 * @throws if invalid block hash is given.
 */
export const getRewardStatusLatest = applyLastBlockHash(getRewardStatus);

/**
 * Gets pool status for baker ID.
 *
 * @throws if no baker is found with supplied baker ID or if invalid block hash given.
 */
export const getPoolStatusLatest = getPoolInfo;

export const fetchLastFinalizedIdentityProviders = applyLastBlockHash(
    getIdentityProviders
);

export const fetchLastFinalizedAnonymityRevokers = applyLastBlockHash(
    getAnonymityRevokers
);

export async function fetchGlobal(specificBlockHash?: string): Promise<Global> {
    let blockHash = specificBlockHash;
    if (!blockHash) {
        const consensusStatus = await getConsensusStatus();
        blockHash = consensusStatus.lastFinalizedBlock.toString();
    }
    return getCryptographicParameters(blockHash);
}

export async function getEnergyToMicroGtuRate(): Promise<Fraction> {
    const params = await getBlockChainParameters();
    const { euroPerEnergy, microGTUPerEuro } = params;
    const denominator = BigInt(
        euroPerEnergy.denominator * microGTUPerEuro.denominator
    );
    const numerator = BigInt(
        euroPerEnergy.numerator * microGTUPerEuro.numerator
    );
    return { numerator, denominator };
}

/**
 * Check whether the node supports memo transactions.
 * memo transactions were added in protocolVersion 2.
 */
export async function nodeSupportsMemo() {
    const consensusStatus = await getConsensusStatus();
    return consensusStatus.protocolVersion >= 2;
}
