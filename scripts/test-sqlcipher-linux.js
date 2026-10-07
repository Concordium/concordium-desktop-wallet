/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function testSqlcipher() {
    const packagePath = process.argv[2]
        ? path.resolve(process.argv[2])
        : path.resolve(__dirname, '../app/node_modules/@journeyapps/sqlcipher');
    const { Database } = require(packagePath);
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), 'wallet-sqlcipher-test-')
    );
    const filename = path.join(directory, 'encrypted.db');
    let database;
    const open = () =>
        new Promise((resolve, reject) => {
            database = new Database(filename, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    const exec = (sql) =>
        new Promise((resolve, reject) => {
            database.exec(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    const get = (sql) =>
        new Promise((resolve, reject) => {
            database.get(sql, (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    const close = () =>
        new Promise((resolve, reject) => {
            database.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    database = undefined;
                    resolve();
                }
            });
        });
    try {
        await open();
        const version = await get('PRAGMA cipher_version');
        assert.ok(version && version.cipher_version);
        await exec(
            "PRAGMA key = 'smoke-test-secret'; CREATE TABLE probe(value TEXT); INSERT INTO probe VALUES ('ok');"
        );
        await close();
        assert.notStrictEqual(
            fs.readFileSync(filename).subarray(0, 16).toString(),
            'SQLite format 3\0'
        );
        await open();
        await exec("PRAGMA key = 'smoke-test-secret'");
        assert.deepStrictEqual(await get('SELECT value FROM probe'), {
            value: 'ok',
        });
        await close();
        await open();
        await exec("PRAGMA key = 'incorrect-secret'");
        await assert.rejects(get('SELECT value FROM probe'), /SQLITE_NOTADB/);
        await close();
        console.log(
            `SQLCipher ${version.cipher_version}: encrypted create/reopen and wrong-key rejection passed (${packagePath})`
        );
    } finally {
        if (database) {
            await close();
        }
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

testSqlcipher().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
