import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.transactionTable, (table) => {
        table.string('memo');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.transactionTable, (table) => {
        table.dropColumn('memo');
    });
}
