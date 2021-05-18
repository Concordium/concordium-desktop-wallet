/* eslint-disable @typescript-eslint/no-explicit-any */
import getPath from './UserDataPathAccessor';

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

export async function getDatabaseFilename() {
    const environment = process.env.NODE_ENV;
    if (environment === 'development') {
        return fetchDevelopmentFilename();
    }
    return getProductionFilename();
}

export default async function getKnexConfiguration(
    environment: string,
    password: string
) {
    // https://github.com/knex/knex/blob/master/CONTRIBUTING.md#i-would-like-to-add-support-for-new-dialect-to-knex-is-it-possible
    // eslint-disable-next-line
    const SQLCipherDialect = require(`knex/lib/dialects/sqlite3/index.js`);
    // eslint-disable-next-line
    SQLCipherDialect.prototype._driver = () =>
        require('@journeyapps/sqlcipher');

    if (environment === 'development') {
        return {
            client: SQLCipherDialect,
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
    if (environment === 'production') {
        return {
            client: SQLCipherDialect,
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
    throw new Error('Environment has to be development or production.');
}
