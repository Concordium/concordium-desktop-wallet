import waitForPreloadReady from '../utils/preloadReady';

let insertCredential: typeof window.database.credentials.insert;
let removeCredential: typeof window.database.credentials.delete;
let removeCredentialsOfAccount: typeof window.database.credentials.deleteForAccount;
let getCredentials: typeof window.database.credentials.getAll;
let getCredentialsForIdentity: typeof window.database.credentials.getForIdentity;
let getCredentialsOfAccount: typeof window.database.credentials.getForAccount;
let getNextCredentialNumber: typeof window.database.credentials.getNextNumber;
let updateCredentialIndex: typeof window.database.credentials.updateIndex;
let updateCredential: typeof window.database.credentials.update;
let hasDuplicateWalletId: typeof window.database.credentials.hasDuplicateWalletId;
let hasExistingCredential: typeof window.database.credentials.hasExistingCredential;

(async () => {
    await waitForPreloadReady();
    ({
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
        hasExistingCredential
    } = window.database.credentials);
})();

export {
    insertCredential,
    removeCredential,
    removeCredentialsOfAccount,
    getCredentials,
    getCredentialsForIdentity,
    getCredentialsOfAccount,
    getNextCredentialNumber,
    updateCredentialIndex,
    updateCredential,
    hasDuplicateWalletId,
    hasExistingCredential
};
