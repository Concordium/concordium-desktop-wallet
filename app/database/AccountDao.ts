import { Account } from '../utils/types';

export const getAllAccounts: typeof window.database.account.getAll = (...args) => window.database.account.getAll(...args);
export const getAccount: typeof window.database.account.getAccount = (...args) => window.database.account.getAccount(...args);
export const insertAccount: typeof window.database.account.insertAccount = (...args) => window.database.account.insertAccount(...args);
export const updateAccount: typeof window.database.account.updateAccount = (...args) => window.database.account.updateAccount(...args);
export const findAccounts: typeof window.database.account.findAccounts = (...args) => window.database.account.findAccounts(...args);
export const removeAccount: typeof window.database.account.removeAccount = (...args) => window.database.account.removeAccount(...args);
export const updateInitialAccount: typeof window.database.account.updateInitialAccount = (...args) => window.database.account.updateInitialAccount(...args);
export const insertFromRecoveryNewIdentity: typeof window.database.account.insertFromRecoveryNewIdentity = (...args) => window.database.account.insertFromRecoveryNewIdentity(...args);
export const insertFromRecoveryExistingIdentity: typeof window.database.account.insertFromRecoveryExistingIdentity = (...args) => window.database.account.insertFromRecoveryExistingIdentity(...args);

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
