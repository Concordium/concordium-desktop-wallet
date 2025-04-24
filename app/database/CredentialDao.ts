import waitForPreloadReady from '../utils/preloadReady';

await waitForPreloadReady();

export const {
    insert: insertCredential,
    delete: removeCredential,
    deleteForAccount: removeCredentialsOfAccount,
    getAll: getCredentials,
    getForIdentity: getCredentialsForIdentity,
    getForAccount: getCredentialsOfAccount,
    getNextNumber: getNextCredentialNumber,
    updateIndex: updateCredentialIndex,
    update: updateCredential,
    hasDuplicateWalletId,
    hasExistingCredential,
} = window.database.credentials;
