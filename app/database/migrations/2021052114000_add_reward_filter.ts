import { Knex } from 'knex';
import { accountsTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(accountsTable, (table) => {
        table.string('rewardFilter').defaultTo('[]');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(accountsTable, (table) => {
        table.dropColumn('rewardFilter');
    });
}
