/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
const knex = require('./migrate').default;
const ScriptMigrationSource = require('./ScriptMigrationSource').default;

async function down() {
    const config = {
        migrationSource: new ScriptMigrationSource(
            './app/database/migrations',
            false,
            /.ts$/
        ),
    };
    const runner = await knex();
    await runner.migrate.down(config).then(console.log);
    await runner.destroy();
}

return down().catch(console.error).finally(process.exit);
