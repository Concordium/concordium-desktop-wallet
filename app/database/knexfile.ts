const electron = require('electron');

const environment = process.env.NODE_ENV;

// Determines the location of the persisted production database file. This is
// saved in the user's user data directory.
let userData = '';
if (environment !== 'development') {
    // TODO: Using remote is bad, and the general consensus is to use IPC over remote. Refactor to avoid usage of remote.
    userData = (electron.app || electron.remote.app).getPath('userData');
}
const productionDatabaseName = 'concordium-desktop-wallet-database.sqlite3';
const productionDatabaseLocation = `${userData}/${productionDatabaseName}`;

const developmentDatabaseName =
    'test-concordium-desktop-wallet-database.sqlite3';
const developmentDatabaseLocation = `./${developmentDatabaseName}`;

module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: developmentDatabaseLocation,
        },
        useNullAsDefault: true,
        migrations: {
            directory: './app/database/migrations',
        },
    },

    production: {
        client: 'sqlite3',
        connection: {
            filename: productionDatabaseLocation,
        },
        useNullAsDefault: true,
    },
};
