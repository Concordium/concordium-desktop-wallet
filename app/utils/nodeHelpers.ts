import { Key } from './NodeApiTypes';
import { getConsensusStatus, getAccountInfo } from './nodeRequests';
import { AccountInfo, Account } from './types';

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
    verifyKey: string
): number {
    const authorizationKeyIndex = keys.findIndex((key) => {
        return key.verifyKey === verifyKey;
    });
    return authorizationKeyIndex;
}
