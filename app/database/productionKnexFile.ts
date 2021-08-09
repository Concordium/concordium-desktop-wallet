/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from 'electron';
import getClient from './knexClient';

export async function getProductionFilename(): Promise<string> {
    const userDataPath = app.getPath('userData');
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
                conn.run(`PRAGMA KEY = '${password}'`);
                conn.run('PRAGMA foreign_keys = ON', cb);
            },
        },
    };
}
