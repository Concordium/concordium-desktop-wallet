import { Hex } from '../utils/types';
import knex from './knex';
import { walletTable } from '../constants/databaseNames.json';

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
 * @param identifier the pairing identifier that identities the hardware wallet uniquely
 */
export async function insertHwWallet(identifier: Hex) {
    const table = (await knex())(walletTable);
    return table.insert({ identifier });
}

/**
 * Check whether or not a hardware wallet with the supplied
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
