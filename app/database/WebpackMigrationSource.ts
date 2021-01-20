/* eslint-disable */
// This class allows us to do dynamic knex migrations from code. The migrations
// have to be checked and run at boot up, so that we are certain that all
// migrations have run before the application starts.
export default class WebpackMigrationSource {
    migrationContext: any;

    constructor(migrationContext: any) {
        this.migrationContext = migrationContext;
    }

    getMigrations() {
        return Promise.resolve(this.migrationContext.keys().sort());
    }

    getMigrationName = (migration: any) => {
        return migration;
    };

    getMigration(migration: any) {
        return this.migrationContext(migration);
    }
}
