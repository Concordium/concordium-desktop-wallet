import { Account } from '../utils/types';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Returns all stored accounts from the database. Attaches the identityName
 * and identityNumber from the identity table.
 */
export async function getAllAccounts(): Promise<Account[]> {
    return window.ipcRenderer.invoke(ipcCommands.database.accounts.getAll);
}

export async function getAccount(
    address: string
): Promise<Account | undefined> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.accounts.getAccount,
        address
    );
}

export async function insertAccount(account: Account | Account[]) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.accounts.insertAccount,
        account
    );
}

export async function updateAccount(
    address: string,
    updatedValues: Partial<Account>
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.accounts.updateAccount,
        address,
        updatedValues
    );
}

export async function findAccounts(condition: Record<string, unknown>) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.accounts.findAccounts,
        condition
    );
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
    return window.ipcRenderer.invoke(
        ipcCommands.database.accounts.removeAccount,
        accountAddress
    );
}

export async function removeInitialAccount(identityId: number) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.accounts.removeInitialAccount,
        identityId
    );
}

export async function confirmInitialAccount(
    identityId: number,
    updatedValues: Partial<Account>
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.accounts.confirmInitialAccount,
        identityId,
        updatedValues
    );
}
