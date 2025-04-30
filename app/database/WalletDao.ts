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
import { WalletEntry } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';
import waitForPreloadReady from '../utils/preloadReady';

/**
 * Extracts all wallet entries from the database
 * @returns all rows in the wallet table
 */
export async function getAllWallets(): Promise<WalletEntry[]> {
    return window.database.general.selectAll(databaseNames.walletTable);
}

let getWalletId: typeof window.database.wallet.getWalletId;
let insertWallet: typeof window.database.wallet.insertWallet;

(async () => {
    await waitForPreloadReady();

    ({ getWalletId, insertWallet } = window.database.wallet);
})();

export { getWalletId, insertWallet };
