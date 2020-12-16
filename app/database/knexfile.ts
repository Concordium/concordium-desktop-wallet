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
        };
    }
    if (environment === 'production') {
        return {
            client: 'sqlite3',
            connection: {
                filename: await getProductionFilename(),
            },
            useNullAsDefault: true,
        };
    }
    throw new Error('Environment has to be development or production.');
}
