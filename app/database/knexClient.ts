export default function getDriver() {
    // https://github.com/knex/knex/blob/master/CONTRIBUTING.md#i-would-like-to-add-support-for-new-dialect-to-knex-is-it-possible
    // eslint-disable-next-line
    const SQLCipherDialect = require(`knex/lib/dialects/sqlite3/index.js`);
    // eslint-disable-next-line
    SQLCipherDialect.prototype._driver = () =>
        require('@journeyapps/sqlcipher');
    return SQLCipherDialect;
}
