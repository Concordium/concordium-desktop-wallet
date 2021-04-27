import { Hex } from '../utils/types';
import knex from './knex';
import { hwWalletTable } from '../constants/databaseNames.json';

/**
 * Insert a unique identifier for a hardware wallet to pair the hardware wallet
 * with the desktop wallet.
 * @param identifier the pairing identifier that identities the hardware wallet uniquely
 */
export async function insertHwWallet(identifier: Hex) {
    const table = (await knex())(hwWalletTable);
    return table.insert({ identifier });
}

/**
 * Check whether or not a hardware wallet with the supplied
 * identifier already exists in the database.
 * @param identifier the pairing identifier of the hardware wallet
 * @returns true if an entry already exists
 */
export async function hardwareWalletExists(identifier: Hex): Promise<boolean> {
    return (
        (
            await (await knex())
                .table(hwWalletTable)
                .where('identifier', identifier)
        ).length > 0
    );
}
