/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
import knex, { getConfig } from './migrate';

async function down() {
    const runner = await knex();
    await runner.migrate.down(getConfig()).then(console.log);
    await runner.destroy();
}

return down().catch(console.error).finally(process.exit);
