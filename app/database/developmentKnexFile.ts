/* eslint-disable @typescript-eslint/no-explicit-any */
import getClient from './knexClient';

export function fetchDevelopmentFilename(): string {
    const developmentDatabaseName =
        'test-concordium-desktop-wallet-database.sqlite3';
    return `./${developmentDatabaseName}`;
}

export function getDevelopmentKnexConfiguration(password: string) {
    return {
        client: getClient(),
        connection: {
            filename: fetchDevelopmentFilename(),
        },
        useNullAsDefault: true,
        migrations: {
            directory: './app/database/migrations',
        },
        pool: {
            afterCreate: (conn: any, cb: any) => {
                conn.run(`PRAGMA KEY = '${password}'`);
                conn.run('PRAGMA foreign_keys = ON', cb);
            },
        },
    };
}
