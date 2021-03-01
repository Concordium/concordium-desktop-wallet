import { Authorization, Key } from './NodeApiTypes';
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

/**
 * Finds the authorization key index for a given verification key. If there
 * is no match, then undefined is returned.
 * @param keys the array of authorization keys from the block summary
 * @param verifyKey verification key to find the index for
 */
export function findAuthorizationKeyIndex(
    keys: Key[],
    authorization: Authorization,
    verifyKey: string
) {
    return keys
        .map((key, index) => {
            return { index, key };
        })
        .filter((key) => authorization.authorizedKeys.includes(key.index))
        .find((indexedKey) => {
            return indexedKey.key.verifyKey === verifyKey;
        });
}

export async function fetchGlobal(): Promise<Global> {
    const consensusStatus = await getConsensusStatus();
    const blockHash = consensusStatus.lastFinalizedBlock;
    const versioned = await getCryptographicParameters(blockHash);
    return versioned.value;
}
