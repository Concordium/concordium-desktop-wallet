import { getConsensusInfo, getAccountInfo } from './client';
import { AccountInfo, Account } from './types';

export interface AccountInfoPair {
    account: Account;
    accountInfo: AccountInfo;
}

// gets the accountInfos for each given accounts. returns a list of objects
// each containing an account and its accountInfo.
export async function getAccountInfos(accounts): AccountInfoPair[] {
    const consenusInfo = JSON.parse((await getConsensusInfo()).getValue());
    const blockHash = consenusInfo.lastFinalizedBlock;
    const accountInfos = await Promise.all(
        accounts.map(async (account) => {
            const response = await getAccountInfo(account.address, blockHash);
            const accountInfo = JSON.parse(response.getValue());
            return { account, accountInfo };
        })
    );
    return accountInfos;
}
