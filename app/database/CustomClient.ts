const Client_SQLite3 = require('knex/src/dialects/sqlite3/index');

class Client_SQLCipher extends Client_SQLite3 {
  driverName = 'sqlite3';
  _driver () {
    return require('@journeyapps/sqlcipher');
  }
};

module.exports = Client_SQLCipher;
