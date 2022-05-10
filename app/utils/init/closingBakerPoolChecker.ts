import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import {
    BakerPoolPendingChangeType,
    DelegationTargetType,
} from '@concordium/node-sdk/lib/src/types';
import { Account, AccountStatus, Dispatch } from '../types';
import { findAccounts } from '~/database/AccountDao';
import {
    getAccountInfoOfAddress,
    getPoolStatusLatest,
} from '~/node/nodeHelpers';
import { triggerClosingBakerPoolNotification } from '~/features/NotificationSlice';

/**
 * Finds all accounts from the database that are currently delegating to a closing baker pool.
 */
async function findAccountsDelegatingToClosingBakerPools() {
    const accounts = await findAccounts({ status: AccountStatus.Confirmed });
    const accountsDelegatingToClosingPool: Account[] = [];

    for (const account of accounts) {
        const accountInfo = await getAccountInfoOfAddress(account.address);
        if (
            isDelegatorAccount(accountInfo) &&
            accountInfo.accountDelegation.delegationTarget.delegateType ===
                DelegationTargetType.Baker
        ) {
            const { bakerId } = accountInfo.accountDelegation.delegationTarget;
            const poolStatus = await getPoolStatusLatest(bakerId);
            if (
                poolStatus.bakerStakePendingChange.pendingChangeType ===
                BakerPoolPendingChangeType.RemovePool
            ) {
                accountsDelegatingToClosingPool.push(account);
            }
        }
    }

    return accountsDelegatingToClosingPool;
}

/**
 * Creates a notification for each account that is currently delegating to a
 * closing baker pool.
 * @param dispatch redux action dispatcher
 */
export default async function checkForClosingBakerPools(dispatch: Dispatch) {
    const accountsDelegatingToClosingPool = await findAccountsDelegatingToClosingBakerPools();

    for (const account of accountsDelegatingToClosingPool) {
        triggerClosingBakerPoolNotification(dispatch, account.name);
    }
}
