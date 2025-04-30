/* eslint-disable import/no-mutable-exports */
/**
 * NOTE: These functions are loaded from the preload script, but they are not available right away.
 *
 * We have to wait for the preload to finish before we can use `window.database`.
 * However, if we use `await` at the top level, TypeScript throws the following error during Jest tests:
 *
 *   error TS1378: Top-level 'await' expressions are only allowed when the 'module' option is set to
 *   'es2022', 'esnext', 'system', 'node16', 'nodenext', or 'preserve', and the 'target' option is set to 'es2017' or higher.
 *
 * Even though our `tsconfig.json` already includes:
 *
 *     "target": "ES2020",
 *     "module": "ESNext",
 *
 * this error still appears when running tests
 *
 * To avoid changing the whole app setup or Jest environment, we use this workaround:
 * 
 * 1. Declare the variables (`let ...`)
 * 2. Wait for preload inside an async IIFE, then assign the values
 * 3. Export the variables so other parts of the app can use them
 *
 * This ensures we don’t access uninitialized APIs and keeps both the app and tests working properly.
 */
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
        hasExistingCredential,
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
    hasExistingCredential,
};
