import {
    getConsensusStatus,
    getAccountInfo,
    getCryptographicParameters,
    getBlockSummary,
    getIdentityProviders,
    getPeerList,
} from './nodeRequests';
import { PeerElement } from '../proto/concordium_p2p_rpc_pb';
import { AccountInfo, Account, Global, Fraction } from '../utils/types';

export interface AccountInfoPair {
    account: Account;
    accountInfo: AccountInfo;
}

export async function getlastFinalizedBlockHash(): Promise<string> {
    const consensusStatus = await getConsensusStatus();
    return consensusStatus.lastFinalizedBlock;
}
/** Gets the accountInfos for each given accounts. returns a list of objects
 *   each containing an account and its accountInfo.
 */
export async function getAccountInfos(
    accounts: Account[]
): Promise<AccountInfoPair[]> {
    const blockHash = await getlastFinalizedBlockHash();
    const accountInfos: AccountInfoPair[] = await Promise.all(
        accounts.map(async (account) => {
            const accountInfo = await getAccountInfo(
                account.address,
                blockHash
            );
            return { account, accountInfo };
        })
    );
    return accountInfos;
}

/** Gets the accountInfo for the given address. */
export async function getAccountInfoOfAddress(
    address: string
): Promise<AccountInfo> {
    const blockHash = await getlastFinalizedBlockHash();
    return getAccountInfo(address, blockHash);
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

export async function fetchLastFinalizedIdentityProviders() {
    const blockHash = await getlastFinalizedBlockHash();
    return getIdentityProviders(blockHash);
}

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
