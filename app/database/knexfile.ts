const electron = require('electron');

const environment = process.env.NODE_ENV;

// Determines the location of the persisted production database file. This is 
// saved in the user's user data directory.
let userData = '';
if (environment !== 'development') {
    // TODO: Using remote is bad, and the general consensus is to use IPC over remote. Refactor to avoid usage of remote.
    userData = (electron.app || electron.remote.app).getPath('userData');
}
let productionDatabaseName = 'concordium-desktop-wallet-database.sqlite3';
let productionDatabaseLocation = userData + '/' + productionDatabaseName;

let developmentDatabaseName = 'test-concordium-desktop-wallet-database.sqlite3';
let developmentDatabaseLocation = './' + developmentDatabaseName;

module.exports = {

    development: {
        client: "sqlite3",
        connection: {
            filename: developmentDatabaseLocation
        },
        useNullAsDefault: true,
        migrations: {
            directory: './app/database/migrations'
        }
    },

    production: {
        client: "sqlite3",
        connection: {
            filename: productionDatabaseLocation
        },
        useNullAsDefault: true,
    }
    
};
