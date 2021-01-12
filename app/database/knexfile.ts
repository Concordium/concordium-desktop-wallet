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

export default async function getKnexConfiguration(environment: string) {
    // Environment is undefined when running knex migrate:make from the CLI, so
    // this configuration is only used to ensure that migrations end up in the
    // correct directory.
    if (!environment) {
        return {
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: fetchDevelopmentFilename(),
            },
            migrations: {
                directory: './migrations',
            },
            pool: {
                afterCreate: (conn, cb) => {
                    conn.run('PRAGMA foreign_keys = ON', cb);
                },
            },
        };
    }
    if (environment === 'development') {
        return {
            client: 'sqlite3',
            connection: {
                filename: fetchDevelopmentFilename(),
            },
            useNullAsDefault: true,
            migrations: {
                directory: './app/database/migrations',
            },
            pool: {
                afterCreate: (conn, cb) => {
                    conn.run('PRAGMA foreign_keys = ON', cb);
                },
            },
        };
    }
    if (environment === 'production') {
        return {
            client: 'sqlite3',
            connection: {
                filename: await getProductionFilename(),
            },
            useNullAsDefault: true,
            pool: {
                afterCreate: (conn, cb) => {
                    conn.run('PRAGMA foreign_keys = ON', cb);
                },
            },
        };
    }
    throw new Error('Environment has to be development or production.');
}
