/* eslint-disable @typescript-eslint/no-explicit-any */
import getPath from './UserDataPathAccessor';

const Dialect = require(`knex/lib/dialects/sqlite3/index.js`);
Dialect.prototype._driver = () => require('@journeyapps/sqlcipher');

async function getProductionFilename(): Promise<string> {
    const userDataPath = await getPath();
    const productionDatabaseName = 'concordium-desktop-wallet-database.sqlite3';
    const productionDatabaseLocation = `${userDataPath}/${productionDatabaseName}`;
    return productionDatabaseLocation;
}

function fetchDevelopmentFilename(): string {
    const developmentDatabaseName =
        'test-concordium-desktop-wallet-database.sqlite3';
    return `./${developmentDatabaseName}`;
}

// TODO The secret key has to be input from the user.

export default async function getKnexConfiguration(environment: string) {
    // Environment is undefined when running knex migrate:make from the CLI, so
    // this configuration is only used to ensure that migrations end up in the
    // correct directory.
    if (!environment) {
        return {
            client: Dialect,
            useNullAsDefault: true,
            connection: {
                filename: fetchDevelopmentFilename(),
            },
            migrations: {
                directory: './migrations',
            },
            pool: {
                afterCreate: (conn: any, cb: any) => {
                    conn.run("PRAGMA KEY = 'secret'");
                    conn.run('PRAGMA foreign_keys = ON', cb);
                },
            },
        };
    }
    if (environment === 'development') {
        return {
            client: Dialect,
            connection: {
                filename: fetchDevelopmentFilename(),
            },
            useNullAsDefault: true,
            migrations: {
                directory: './app/database/migrations',
            },
            pool: {
                afterCreate: (conn: any, cb: any) => {
                    conn.run("PRAGMA KEY = 'secret'");
                    conn.run('PRAGMA foreign_keys = ON', cb);
                },
            },
        };
    }
    if (environment === 'production') {
        return {
            client: Dialect,
            connection: {
                filename: await getProductionFilename(),
            },
            useNullAsDefault: true,
            pool: {
                afterCreate: (conn: any, cb: any) => {
                    conn.run("PRAGMA KEY = 'secret'");
                    conn.run('PRAGMA foreign_keys = ON', cb);
                },
            },
        };
    }
    throw new Error('Environment has to be development or production.');
}
