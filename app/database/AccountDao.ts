/* eslint-disable import/no-mutable-exports */
import { Account } from '../utils/types';
import waitForPreloadReady from '../utils/preloadReady';

let getAllAccounts: typeof window.database.account.getAll;
let getAccount: typeof window.database.account.getAccount;
let insertAccount: typeof window.database.account.insertAccount;
let updateAccount: typeof window.database.account.updateAccount;
let findAccounts: typeof window.database.account.findAccounts;
let removeAccount: typeof window.database.account.removeAccount;
let updateInitialAccount: typeof window.database.account.updateInitialAccount;
let insertFromRecoveryNewIdentity: typeof window.database.account.insertFromRecoveryNewIdentity;
let insertFromRecoveryExistingIdentity: typeof window.database.account.insertFromRecoveryExistingIdentity;

(async () => {
    await waitForPreloadReady();
    ({
        getAll: getAllAccounts,
        getAccount,
        insertAccount,
        updateAccount,
        findAccounts,
        removeAccount,
        updateInitialAccount,
        insertFromRecoveryNewIdentity,
        insertFromRecoveryExistingIdentity,
    } = window.database.account);
})();

export {
    getAllAccounts,
    getAccount,
    insertAccount,
    updateAccount,
    findAccounts,
    removeAccount,
    updateInitialAccount,
    insertFromRecoveryNewIdentity,
    insertFromRecoveryExistingIdentity,
};

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
