import { getConsensusStatus, getAccountInfo } from './client';
import { AccountInfo, Account } from './types';

export interface AccountInfoPair {
    account: Account;
    accountInfo: AccountInfo;
}

// gets the accountInfos for each given accounts. returns a list of objects
// each containing an account and its accountInfo.
export async function getAccountInfos(accounts): Promise<AccountInfoPair[]> {
    const consensusStatus = await getConsensusStatus();
    const blockHash = consensusStatus.lastFinalizedBlock;
    const accountInfos: AccountInfoPair[] = await Promise.all(
        accounts.map(async (account) => {
            const response = await getAccountInfo(account.address, blockHash);
            const accountInfo = JSON.parse(response.getValue());
            return { account, accountInfo };
        })
    );
    return accountInfos;
}
