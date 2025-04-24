import { Account } from '../utils/types';
import waitForPreloadReady from '../utils/preloadReady';

await waitForPreloadReady();

export const {
    getAll: getAllAccounts,
    getAccount,
    insertAccount,
    updateAccount,
    findAccounts,
    removeAccount,
    updateInitialAccount,
    insertFromRecoveryNewIdentity,
    insertFromRecoveryExistingIdentity,
} = window.database.account;

/**
 * Extracts all accounts for a given identity.
 * @param identityId the id of the identity to get the accounts for
 * @returns all accounts attached to the provided identity
 */
export async function getAccountsOfIdentity(
    identityId: number
): Promise<Account[]> {
    return findAccounts({ identityId });
}
