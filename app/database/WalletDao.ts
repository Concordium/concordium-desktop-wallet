import { Hex, WalletEntry, WalletType } from '../utils/types';
import { walletTable } from '../constants/databaseNames.json';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Extracts all wallet entries from the database
 * @returns all rows in the wallet table
 */
export async function getAllWallets(): Promise<WalletEntry[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.dbSelectAll,
        walletTable
    );
}

/**
 * Finds the primary key id for the wallet with the given identifier.
 * @param identifier wallet identifier
 * @returns primary key for the wallet entry
 */
export async function getId(identifier: Hex): Promise<number | undefined> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.dbGetWalletId,
        identifier
    );
}

/**
 * Insert a unique identifier for a hardware wallet to pair the hardware wallet
 * with the desktop wallet.
 * @param identifier the pairing identifier that identities the wallet uniquely
 * @returns the id of the inserted row
 */
export async function insertWallet(
    identifier: Hex,
    type: WalletType
): Promise<number> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.dbInsertWallet,
        identifier,
        type
    );
}
