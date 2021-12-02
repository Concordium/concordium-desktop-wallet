import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.accountsTable, (table) => {
        table.string('rewardFilter').defaultTo('[]');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.accountsTable, (table) => {
        table.dropColumn('rewardFilter');
    });
}
