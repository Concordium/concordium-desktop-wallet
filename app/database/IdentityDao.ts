import { Identity } from '../utils/types';
import { identitiesTable } from '../constants/databaseNames.json';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Get the identity number to be used to create the next identity with
 * the wallet with the given id.
 * @param walletId the database id key for the wallet used
 * @returns the id for the next identity to be created by the given wallet
 */
export async function getNextIdentityNumber(walletId: number): Promise<number> {
    return window.ipcRenderer.invoke('dbGetNextIdentityNumber', walletId);
}

export async function getAllIdentities(): Promise<Identity[]> {
    return window.ipcRenderer.invoke(ipcCommands.dbSelectAll, identitiesTable);
}

export async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    return window.ipcRenderer.invoke('dbInsertIdentitiy', identity);
}

export async function updateIdentity(
    id: number,
    updatedValues: Record<string, unknown>
) {
    return window.ipcRenderer.invoke('dbUpdateIdentity', id, updatedValues);
}

/**
 * Find all the identities for a given wallet.
 * @returns a list of identities that have been created from the supplied wallet
 */
export async function getIdentitiesForWallet(
    walletId: number
): Promise<Identity[]> {
    return window.ipcRenderer.invoke('dbGetIdentitiesForWallet', walletId);
}
