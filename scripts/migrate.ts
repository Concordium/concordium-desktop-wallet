/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
const externalKnex = require('knex');

function fetchDevelopmentFilename(): string {
    const developmentDatabaseName =
        'test-concordium-desktop-wallet-database.sqlite3';
    return `./${developmentDatabaseName}`;
}

async function getKnexConfiguration(password: string) {
    // https://github.com/knex/knex/blob/master/CONTRIBUTING.md#i-would-like-to-add-support-for-new-dialect-to-knex-is-it-possible
    const SQLCipherDialect = require(`knex/lib/dialects/sqlite3/index.js`);
    SQLCipherDialect.prototype._driver = () =>
        require('@journeyapps/sqlcipher');

    return {
        client: SQLCipherDialect,
        connection: {
            filename: fetchDevelopmentFilename(),
        },
        useNullAsDefault: true,
        migrations: {
            extension: 'ts',
            directory: './app/database/migrations',
            loadExtensions: ['.ts'],
        },
        pool: {
            afterCreate: (conn: any, cb: any) => {
                conn.run(`PRAGMA KEY = '${password}'`);
                conn.run('PRAGMA foreign_keys = ON', cb);
            },
        },
    };
}

export default async function knex() {
    const password = process.argv[2];

    if (!password) {
        throw new Error('Please provide database password as argument');
    }

    const configuration = await getKnexConfiguration(password);
    return externalKnex(configuration);
}
