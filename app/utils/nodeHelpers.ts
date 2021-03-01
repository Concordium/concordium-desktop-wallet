import {
    getConsensusStatus,
    getAccountInfo,
    getCryptographicParameters,
} from './nodeRequests';
import { AccountInfo, Account, Global } from './types';

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

export async function fetchGlobal(): Promise<Global> {
    const consensusStatus = await getConsensusStatus();
    const blockHash = consensusStatus.lastFinalizedBlock;
    const versioned = await getCryptographicParameters(blockHash);
    return versioned.value;
}
