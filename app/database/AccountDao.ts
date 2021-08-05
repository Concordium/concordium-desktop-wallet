import { Account } from '../utils/types';

export default () => window.database.account;

/**
 * Extracts all accounts for a given identity.
 * @param identityId the id of the identity to get the accounts for
 * @returns all accounts attached to the provided identity
 */
export async function getAccountsOfIdentity(
    identityId: number
): Promise<Account[]> {
    return window.database.account.findAccounts({ identityId });
}

export const getAccount: typeof window.database.account.getAccount = (
    ...args
) => window.database.account.getAccount(...args);
