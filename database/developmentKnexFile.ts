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
                // Use a bound parameter instead of string interpolation to
                // avoid SQL injection / statement corruption from passwords
                // that contain quote characters.
                conn.run('PRAGMA key = ?', [password]);
                conn.run('PRAGMA foreign_keys = ON', cb);
            },
        },
    };
}
