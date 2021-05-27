import {
    getConsensusStatus,
    getAccountInfo,
    getCryptographicParameters,
    getBlockSummary,
} from './nodeRequests';
import { AccountInfo, Account, Global, Fraction } from './types';

export interface AccountInfoPair {
    account: Account;
    accountInfo: AccountInfo;
}

// gets the accountInfos for each given accounts. returns a list of objects
// each containing an account and its accountInfo.
export async function getAccountInfos(
    accounts: Account[]
): Promise<AccountInfoPair[]> {
    const consensusStatus = await getConsensusStatus();
    const blockHash = consensusStatus.lastFinalizedBlock;
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

export async function getAccountInfoOfAddress(
    address: string
): Promise<AccountInfo> {
    const consensusStatus = await getConsensusStatus();
    const blockHash = consensusStatus.lastFinalizedBlock;
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
