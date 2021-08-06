import { Hex, WalletEntry, WalletType } from '~/utils/types';
import { knex } from '~/database/knex';
import { walletTable } from '~/constants/databaseNames.json';
import { WalletMethods } from '~/preload/preloadTypes';

/**
 * Finds the primary key id for the wallet with the given identifier.
 * @param identifier wallet identifier
 * @returns primary key for the wallet entry
 */
async function getWalletId(identifier: Hex) {
    const table = (await knex())(walletTable);
    const result: WalletEntry = await table
        .where('identifier', identifier)
        .first();
    if (result === undefined) {
        return undefined;
    }
    return result.id;
}

/**
 * Insert a unique identifier for a hardware wallet to pair the hardware wallet
 * with the desktop wallet.
 * @param identifier the pairing identifier that identities the wallet uniquely
 * @returns the id of the inserted row
 */
async function insertWallet(identifier: Hex, type: WalletType) {
    const table = (await knex())(walletTable);
    return (await table.insert({ identifier, type }))[0];
}

const exposedMethods: WalletMethods = {
    getWalletId,
    insertWallet,
};

export default exposedMethods;
