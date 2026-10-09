/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcRenderer } from 'electron';
import getClient from './knexClient';
import ipcCommands from '../constants/ipcCommands.json';

// This function assumes that it is executed in the preload script.
export async function getProductionFilename(): Promise<string> {
    const userDataPath = await ipcRenderer.invoke(ipcCommands.getUserDataPath);
    const productionDatabaseName = 'concordium-desktop-wallet-database.sqlite3';
    const productionDatabaseLocation = `${userDataPath}/${productionDatabaseName}`;
    return productionDatabaseLocation;
}

export async function getProductionKnexConfiguration(password: string) {
    return {
        client: getClient(),
        connection: {
            filename: await getProductionFilename(),
        },
        useNullAsDefault: true,
        pool: {
            afterCreate: (conn: any, cb: any) => {
                // Use a bound parameter instead of string interpolation to
                // avoid SQL injection / statement corruption from passwords
                // that contain quote characters.
                conn.run('PRAGMA key = ?', [password]);
                conn.run('PRAGMA foreign_keys = ON', cb);
            },
        },
    };
}
