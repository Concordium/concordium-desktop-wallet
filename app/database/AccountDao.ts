import { Account } from '../utils/types';

export function convertAccountBooleans(accounts: Account[]) {
    return accounts.map((account) => {
        return {
            ...account,
            allDecrypted: Boolean(account.allDecrypted),
            isInitial: Boolean(account.isInitial),
        };
    });
}

/**
 * Returns all stored accounts from the database. Attaches the identityName
 * and identityNumber from the identity table.
 */
export async function getAllAccounts(): Promise<Account[]> {
    return window.ipcRenderer.invoke('dbGetAllAccounts');
}

export async function getAccount(
    address: string
): Promise<Account | undefined> {
    return window.ipcRenderer.invoke('dbGetAccount', address);
}

export async function insertAccount(account: Account | Account[]) {
    return window.ipcRenderer.invoke('insertAccount', account);
}

export async function updateAccount(
    address: string,
    updatedValues: Partial<Account>
) {
    return window.ipcRenderer.invoke('updateAccount', address, updatedValues);
}

export async function findAccounts(condition: Record<string, unknown>) {
    return window.ipcRenderer.invoke('dbFindAccounts', condition);
}

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

export async function removeAccount(accountAddress: string) {
    return window.ipcRenderer.invoke('dbRemoveAccount', accountAddress);
}

export async function removeInitialAccount(identityId: number) {
    return window.ipcRenderer.invoke('dbRemoveInitialAccount', identityId);
}

export async function confirmInitialAccount(
    identityId: number,
    updatedValues: Partial<Account>
) {
    return window.ipcRenderer.invoke(
        'dbConfirmInitialAccount',
        identityId,
        updatedValues
    );
}
