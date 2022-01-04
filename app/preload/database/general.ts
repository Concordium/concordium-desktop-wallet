/* eslint-disable @typescript-eslint/no-explicit-any */
import { knex as externalKnex } from 'knex';
import { invalidateKnexSingleton, knex, setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import databaseNames from '~/constants/databaseNames.json';
import config from '~/database/knexfile';
import { GeneralMethods } from '~/preload/preloadTypes';

/**
 * Checks the connection to the database by trying to select
 * all from the settings table.
 * @returns true if the connection to the database is working, otherwise false
 */
async function checkDatabaseAccess(): Promise<boolean> {
    try {
        const table = (await knex())(databaseNames.settingsTable);
        await table.select();
        return true;
    } catch {
        return false;
    }
}

/**
 * Rekeys the database, i.e. changes the password that the database
 * is encrypted under.
 * @param oldPassword the current password for the database
 * @param newPassword the password to rekey the database to
 * @returns true if the database was successfully rekeyed, otherwise false
 */
async function rekeyDatabase(oldPassword: string, newPassword: string) {
    const environment = process.env.NODE_ENV;
    if (!environment) {
        throw new Error(
            'The NODE_ENV environment variable was not available as expected.'
        );
    }

    const configuration = await config(environment, oldPassword);
    try {
        const db = externalKnex(configuration);
        await db.select().table('setting');
    } catch (e) {
        return false;
    }
    await (await knex()).raw('PRAGMA rekey = ??', newPassword);
    return true;
}

const exposedMethods: GeneralMethods = {
    rekeyDatabase,
    checkAccess: checkDatabaseAccess,
    setPassword,
    invalidateKnexSingleton,
    migrate,
    selectFirst: async (tableName: string) => {
        return (await knex()).table(tableName).first();
    },
    selectAll: async (tableName: string) => {
        const table = (await knex())(tableName);
        return table.select();
    },
};
export default exposedMethods;
