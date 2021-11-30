import { Knex } from 'knex';
import { identitiesTable } from '~/constants/databaseNames.json';

const versionField = 'version';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(identitiesTable, (table) => {
        table.integer(versionField).defaultTo(0).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(identitiesTable, (table) => {
        table.dropColumn(versionField);
    });
}
