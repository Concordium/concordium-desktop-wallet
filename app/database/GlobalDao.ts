import { Global } from '../utils/types';
import knex from './knex';
import { globalTable } from '../constants/databaseNames.json';

/**
 * Returns all stored accounts
 *  - Attaches the identityName unto the account object.
 */
export async function getGlobal(): Promise<Global> {
    return (await knex()).table(globalTable).first();
}

export async function insertGlobal(global: Global) {
    const table = (await knex())(globalTable);
    await table.del(); // reset;
    return table.insert(global);
}
