import { knex } from './knex';
import WebpackMigrationSource from './WebpackMigrationSource';

/**
 * Executes the database migrations in from the ./migrations directory.
 * If the migrations have already been run, then nothing happens. If the migrations
 * fail to run, then application is destroyed to avoid data corruption.
 */
export default async function migrate() {
    const config = {
        migrationSource: new WebpackMigrationSource(
            require.context('./migrations', false, /.ts$/)
        ),
    };

    try {
        await (await knex()).migrate.latest(config);
    } catch (error) {
        process.nextTick(() => {
            process.exit(0);
        });
    }
}
