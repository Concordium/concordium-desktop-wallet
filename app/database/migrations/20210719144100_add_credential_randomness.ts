import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.credentialsTable, (table) => {
        table.string('randomness');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.credentialsTable, (table) => {
        table.dropColumn('randomness');
    });
}
