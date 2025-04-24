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

await waitForPreloadReady();
export const { getWalletId, insertWallet } = window.database.wallet;
