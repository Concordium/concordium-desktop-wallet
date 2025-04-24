/* eslint-disable import/no-mutable-exports */
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
