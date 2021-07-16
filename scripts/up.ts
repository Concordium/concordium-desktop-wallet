/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
const knex = require('./migrate').default;
const ScriptMigrationSource = require('./ScriptMigrationSource').default;

async function up() {
    const config = {
        migrationSource: new ScriptMigrationSource(
            './app/database/migrations',
            false,
            /.ts$/
        ),
    };
    const runner = await knex();
    await runner.migrate.up(config).then(console.log);
    await runner.destroy();
}

return up().catch(console.error).finally(process.exit);
