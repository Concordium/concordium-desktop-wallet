import { knex } from './knex';
import WebpackMigrationSource from './WebpackMigrationSource';

/**
 * Executes the database migrations in from the ./migrations directory.
 * If the migrations have already been run, then nothing happens.
 */
export default async function migrate(): Promise<boolean> {
    const config = {
        migrationSource: new WebpackMigrationSource(
            require.context('./migrations', false, /.ts$/)
        ),
    };

    try {
        await (await knex()).migrate.latest(config);
        return true;
    } catch (error) {
        return false;
    }
}
