import { Credential, CredentialWithIdentityNumber } from '../utils/types';
import ipcCommands from '../constants/ipcCommands.json';

export async function insertCredential(credential: Credential) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.insert,
        credential
    );
}

export async function removeCredential(credential: Partial<Credential>) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.delete,
        credential
    );
}

export async function removeCredentialsOfAccount(accountAddress: string) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.deleteForAccount,
        accountAddress
    );
}

export async function getCredentials(): Promise<
    CredentialWithIdentityNumber[]
> {
    return window.ipcRenderer.invoke(ipcCommands.database.credentials.getAll);
}

/**
 * Get all credentials for the given identity id, i.e. exactly those credentials
 * that refer to a specific identity.
 */
export async function getCredentialsForIdentity(
    identityId: number
): Promise<Credential[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.getForIdentity,
        identityId
    );
}

/**
 * Get all credentials for the account with the given account address. The identity
 * number is joined in from the identity table, and the walletId is joined from
 * the wallet table and augmented into the credential object.
 * @param accountAddress address of the account to get the credentials for
 * @returns an array of credentials for the given account, augmented with the identityNumber and walletId
 */
export async function getCredentialsOfAccount(
    accountAddress: string
): Promise<CredentialWithIdentityNumber[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.getForAccount,
        accountAddress
    );
}

export async function getNextCredentialNumber(identityId: number) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.getNextNumber,
        identityId
    );
}

export async function updateCredentialIndex(
    credId: string,
    credentialIndex: number | undefined
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.updateIndex,
        credId,
        credentialIndex
    );
}

export async function updateCredential(
    credId: string,
    updatedValues: Partial<Credential>
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.update,
        credId,
        updatedValues
    );
}

export async function hasDuplicateWalletId(
    accountAddress: string,
    credId: string,
    otherCredIds: string[]
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.hasDuplicateWalletId,
        accountAddress,
        credId,
        otherCredIds
    );
}

export async function hasExistingCredential(
    accountAddress: string,
    currentWalletId: number
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.credentials.hasExistingCredential,
        accountAddress,
        accountAddress,
        currentWalletId
    );
}
