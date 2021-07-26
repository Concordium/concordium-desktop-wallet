import { FsMigrations } from 'knex/lib/migrations/migrate/sources/fs-migrations';

export default class ScriptMigrationSource extends FsMigrations {
    getMigrationName(migration) {
        return `./${migration.file}`;
    }
}
