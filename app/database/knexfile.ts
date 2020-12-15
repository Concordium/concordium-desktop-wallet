const electron = require('electron');

// Determines the location of the persisted production database file. This is 
// saved in the user's user data directory.
// TODO: Using remote is bad, and the general consensus is to use IPC over remote. Refactor to avoid usage of remote.
let userData = (electron.app || electron.remote.app).getPath('userData');
let productionDatabaseName = 'concordium-desktop-wallet-database.sqlite3';
let productionDatabaseLocation = userData + '/' + productionDatabaseName;

module.exports = {

    development: {
        client: "sqlite3",
        connection: {
            filename: "./app/database/dev.sqlite3"
        },
        useNullAsDefault: true
    },

    production: {
        client: "sqlite3",
        connection: {
            filename: productionDatabaseLocation
        },
        useNullAsDefault: true,
    }
    
};
