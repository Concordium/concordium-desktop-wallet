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
import { Identity } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';

import waitForPreloadReady from '../utils/preloadReady';

export async function getAllIdentities(): Promise<Identity[]> {
    return window.database.general.selectAll(databaseNames.identitiesTable);
}

let getNextIdentityNumber: typeof window.database.identity.getNextIdentityNumber;
let insertIdentity: typeof window.database.identity.insert;
let updateIdentity: typeof window.database.identity.update;
let getIdentitiesForWallet: typeof window.database.identity.getIdentitiesForWallet;
let insertPendingIdentity: typeof window.database.identity.insertPendingIdentity;
let rejectIdentity: typeof window.database.identity.rejectIdentity;
let removeIdentity: typeof window.database.identity.removeIdentity;
let confirmIdentity: typeof window.database.identity.confirmIdentity;

(async () => {
    await waitForPreloadReady();
    ({
        getNextIdentityNumber,
        insert: insertIdentity,
        update: updateIdentity,
        getIdentitiesForWallet,
        insertPendingIdentity,
        rejectIdentity,
        removeIdentity,
        confirmIdentity,
    } = window.database.identity);
})();

export {
    getNextIdentityNumber,
    insertIdentity,
    updateIdentity,
    getIdentitiesForWallet,
    insertPendingIdentity,
    rejectIdentity,
    removeIdentity,
    confirmIdentity,
};
