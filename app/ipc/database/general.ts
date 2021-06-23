/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcMain } from 'electron';
import { knex as externalKnex } from 'knex';
import ipcCommands from '~/constants/ipcCommands.json';
import { invalidateKnexSingleton, knex, setPassword } from '~/database/knex';
import migrate from '~/database/migration';
import { settingsTable } from '~/constants/databaseNames.json';
import config from '~/database/knexfile';

/**
 * Checks the connection to the database by trying to select
 * all from the settings table.
 * @returns true if the connection to the database is working, otherwise false
 */
async function checkDatabaseAccess(): Promise<boolean> {
    try {
        const table = (await knex())(settingsTable);
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

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.rekeyDatabase,
        async (_event, oldPassword: string, newPassword: string) => {
            return rekeyDatabase(oldPassword, newPassword);
        }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.database.checkAccess, async (_event) => {
        return checkDatabaseAccess();
    });

    ipcMain.handle(
        ipcCommands.database.setPassword,
        (_event, password: string) => {
            setPassword(password);
        }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.database.invalidateKnexSingleton, (_event) => {
        invalidateKnexSingleton();
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.database.migrate, async (_event) => {
        return migrate();
    });

    ipcMain.handle(
        ipcCommands.database.selectFirst,
        async (_event, tableName: string) => {
            return (await knex()).table(tableName).first();
        }
    );

    ipcMain.handle(
        ipcCommands.database.dbSelectAll,
        async (_event, tableName: string) => {
            const table = (await knex())(tableName);
            return table.select();
        }
    );
}
