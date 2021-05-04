import { Hex, WalletEntry, WalletType } from '../utils/types';
import knex from './knex';
import { walletTable } from '../constants/databaseNames.json';

/**
 * Extracts all wallet entries from the database
 * @returns all wallet enetries
 */
export async function getAllWallets(): Promise<WalletEntry[]> {
    const table = (await knex())(walletTable);
    return table.select();
}

/**
 * Finds the primary key id for the wallet with the given identifier.
 * @param identifier wallet identifier
 * @returns primary key for the wallet entry
 */
export async function getId(identifier: Hex): Promise<number> {
    const table = (await knex())(walletTable);
    const result = await table.where('identifier', identifier);
    return result[0].id;
}

/**
 * Insert a unique identifier for a hardware wallet to pair the hardware wallet
 * with the desktop wallet.
 * @param identifier the pairing identifier that identities the wallet uniquely
 * @returns the id of the inserted row
 */
export async function insertWallet(identifier: Hex, type: WalletType) {
    const table = (await knex())(walletTable);
    return (await table.insert({ identifier, type }))[0];
}

/**
 * Check whether or not a wallet with the supplied
 * identifier already exists in the database.
 * @param identifier the pairing identifier of the hardware wallet
 * @returns true if an entry already exists
 */
export async function walletExists(identifier: Hex): Promise<boolean> {
    return (
        (
            await (await knex())
                .table(walletTable)
                .where('identifier', identifier)
        ).length > 0
    );
}
