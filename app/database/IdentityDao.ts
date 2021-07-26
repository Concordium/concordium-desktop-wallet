import {
    Account,
    AddressBookEntry,
    Credential,
    Identity,
} from '../utils/types';
import { identitiesTable } from '../constants/databaseNames.json';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Get the identity number to be used to create the next identity with
 * the wallet with the given id.
 * @param walletId the database id key for the wallet used
 * @returns the id for the next identity to be created by the given wallet
 */
export async function getNextIdentityNumber(walletId: number): Promise<number> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.identity.getNextIdentityNumber,
        walletId
    );
}

export async function getAllIdentities(): Promise<Identity[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.dbSelectAll,
        identitiesTable
    );
}

export async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.identity.insert,
        identity
    );
}

export async function updateIdentity(
    id: number,
    updatedValues: Partial<Identity>
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.identity.update,
        id,
        updatedValues
    );
}

export async function removeIdentityAndInitialAccount(id: number) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.identity.removeIdentityAndInitialAccount,
        id
    );
}

/**
 * Find all the identities for a given wallet.
 * @returns a list of identities that have been created from the supplied wallet
 */
export async function getIdentitiesForWallet(
    walletId: number
): Promise<Identity[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.identity.getIdentitiesForWallet,
        walletId
    );
}

/**
 * Updates the status of an identity to 'Rejected' and deletes its associated
 * initial account in the same transaction.
 * @param identityId the identity to reject
 */
export async function rejectIdentityAndInitialAccount(identityId: number) {
    await window.ipcRenderer.invoke(
        ipcCommands.database.identity.rejectIdentityAndInitialAccount,
        identityId
    );
}

/**
 * Confirms an identity by updating its status, adding the identity object, the account, the credential and
 * a corresponding address book entry. All the database actions occur transactionally.
 */
export async function confirmIdentity(
    identityId: number,
    identityObjectJson: string,
    accountAddress: string,
    credential: Credential,
    addressBookEntry: AddressBookEntry
) {
    await window.ipcRenderer.invoke(
        ipcCommands.database.identity.confirmIdentity,
        identityId,
        identityObjectJson,
        accountAddress,
        credential,
        addressBookEntry
    );
}

/**
 * Inserts an identity and its corresponding initial account transactionally.
 * @returns the identityId of the inserted identity
 */
export async function insertPendingIdentityAndInitialAccount(
    identity: Partial<Identity>,
    initialAccount: Omit<Account, 'identityId'>
): Promise<number> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.identity.insertPendingIdentityAndInitialAccount,
        identity,
        initialAccount
    );
}
