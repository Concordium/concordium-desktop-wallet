export const {
    insert: insertCredential,
    delete: removeCredential,
    deleteForAccount: removeCredentialsOfAccount,
    getAll: getCredentials,
    getForIdentity: getCredentialsForIdentity,
    getForAccount: getCredentialsOfAccount,
    getNextNumber: getNextCredentialNumber,
    update: updateCredential,
    hasDuplicateWalletId,
    hasExistingCredential,
} = window.database.credentials;
