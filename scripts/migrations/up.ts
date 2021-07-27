/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
import knex, { getConfig } from './migrate';

async function up() {
    const runner = await knex();
    await runner.migrate.up(getConfig()).then(console.log);
    await runner.destroy();
}

return up().catch(console.error).finally(process.exit);
