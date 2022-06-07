import {
    TransactionStatusEnum,
    TransactionSummary,
} from '@concordium/node-sdk/lib/src/types';
import {
    getConsensusStatus,
    getAccountInfo,
    getCryptographicParameters,
    getBlockSummary,
    getIdentityProviders,
    getAnonymityRevokers,
    getPeerList,
    getTransactionStatus,
    getPoolStatus,
    getRewardStatus,
} from './nodeRequests';
import { PeerElement } from '../proto/concordium_p2p_rpc_pb';
import {
    AccountInfo,
    Global,
    Fraction,
    TransactionStatus,
} from '../utils/types';

export async function getlastFinalizedBlockHash(): Promise<string> {
    const consensusStatus = await getConsensusStatus();
    return consensusStatus.lastFinalizedBlock;
}

/**
 * Gets the accountInfo for the given address.
 * Throws an error, if the node doesn't return an accountInfo object.
 */
export async function getAccountInfoOfAddress(
    address: string
): Promise<AccountInfo> {
    const blockHash = await getlastFinalizedBlockHash();
    const accountInfo = await getAccountInfo(address, blockHash);
    if (!accountInfo) {
        throw new Error(
            `Address ${address} does not represent an account on the connected node. Please check that your node is up to date with the blockchain.`
        );
    }
    return accountInfo;
}

export async function fetchLastFinalizedBlockSummary() {
    const consensusStatus = await getConsensusStatus();
    const lastFinalizedBlockSummary = await getBlockSummary(
        consensusStatus.lastFinalizedBlock
    );
    return {
        consensusStatus,
        lastFinalizedBlockSummary,
    };
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
export const getPoolStatusLatest = applyLastBlockHash(getPoolStatus);

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
        blockHash = consensusStatus.lastFinalizedBlock;
    }
    const versioned = await getCryptographicParameters(blockHash);
    return versioned.value;
}

export async function getEnergyToMicroGtuRate(): Promise<Fraction> {
    const consensusStatus = await getConsensusStatus();
    const blockSummary = await getBlockSummary(
        consensusStatus.lastFinalizedBlock
    );
    const { euroPerEnergy } = blockSummary.updates.chainParameters;
    const { microGTUPerEuro } = blockSummary.updates.chainParameters;
    const denominator = BigInt(
        euroPerEnergy.denominator * microGTUPerEuro.denominator
    );
    const numerator = BigInt(
        euroPerEnergy.numerator * microGTUPerEuro.numerator
    );
    return { numerator, denominator };
}

/**
 * Check whether the node is up to date.
 * N.B. that this is a heuristic guess, which assumes if more than half the peers are not synchronized with the node,
 * the node is not up to date.
 */
export async function isNodeUpToDate() {
    const peersQuery = await getPeerList();
    const peers = peersQuery.getPeersList();

    const pendingPeers = peers.filter(
        (p) => p.getCatchupStatus() === PeerElement.CatchupStatus.PENDING
    );
    const halfOfThePeers = Math.floor(peers.length / 2);

    return pendingPeers.length < halfOfThePeers;
}

/**
 * Check whether the node supports memo transactions.
 * memo transactions were added in protocolVersion 2.
 */
export async function nodeSupportsMemo() {
    const consensusStatus = await getConsensusStatus();
    return consensusStatus.protocolVersion >= 2;
}

export interface StatusResponse {
    status: TransactionStatus;
    outcomes: Record<string, TransactionSummary>;
}

/**
 * Queries the node for the status of the transaction with the provided transaction hash.
 * The polling will continue until the transaction becomes absent or finalized.
 * @param transactionHash the hash of the transaction to get the status for
 * @param pollingIntervalM, optional, interval between polling in milliSeconds, defaults to every 20 seconds.
 */
export async function getStatus(
    transactionHash: string,
    pollingIntervalMs = 20000
): Promise<StatusResponse> {
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            let response;
            try {
                response = await getTransactionStatus(transactionHash);
            } catch (err) {
                // This happens if the node cannot be reached. Just wait for the next
                // interval and try again.
                return;
            }
            // if there is no response, the transaction is absent.
            if (!response) {
                clearInterval(interval);
                resolve({ status: TransactionStatus.Rejected, outcomes: {} });
                return;
            }

            if (response.status === TransactionStatusEnum.Finalized) {
                clearInterval(interval);
                resolve({
                    status: TransactionStatus.Finalized,
                    outcomes: response.outcomes || {},
                });
            }
        }, pollingIntervalMs);
    });
}
