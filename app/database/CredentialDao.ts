import { Credential } from '../utils/types';

export const insertCredential = (credential: Credential) =>
    window.database.credentials.insert(credential);

export function removeCredential(credential: Partial<Credential>) {
    return window.database.credentials.delete(credential);
}

export function removeCredentialsOfAccount(accountAddress: string) {
    return window.database.credentials.deleteForAccount(accountAddress);
}

export function getCredentials() {
    return window.database.credentials.getAll();
}

/**
 * Get all credentials for the given identity id, i.e. exactly those credentials
 * that refer to a specific identity.
 */
export function getCredentialsForIdentity(
    identityId: number
): Promise<Credential[]> {
    return window.database.credentials.getForIdentity(identityId);
}

/**
 * Get all credentials for the account with the given account address. The identity
 * number is joined in from the identity table, and the walletId is joined from
 * the wallet table and augmented into the credential object.
 * @param accountAddress address of the account to get the credentials for
 * @returns an array of credentials for the given account, augmented with the identityNumber and walletId
 */
export function getCredentialsOfAccount(accountAddress: string) {
    return window.database.credentials.getForAccount(accountAddress);
}

export function getNextCredentialNumber(identityId: number) {
    return window.database.credentials.getNextNumber(identityId);
}

export function updateCredentialIndex(
    credId: string,
    credentialIndex: number | undefined
) {
    return window.database.credentials.updateIndex(credId, credentialIndex);
}

export function updateCredential(
    credId: string,
    updatedValues: Partial<Credential>
) {
    return window.database.credentials.update(credId, updatedValues);
}

export function hasDuplicateWalletId(
    accountAddress: string,
    credId: string,
    otherCredIds: string[]
) {
    return window.database.credentials.hasDuplicateWalletId(
        accountAddress,
        credId,
        otherCredIds
    );
}

export function hasExistingCredential(
    accountAddress: string,
    currentWalletId: number
) {
    return window.database.credentials.hasExistingCredential(
        accountAddress,
        currentWalletId
    );
}
