/* eslint-disable */
import { Knex } from 'knex';
import { transactionTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(transactionTable, (table) => {
        table.index('status');
        table.index('transactionKind');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(transactionTable, (table) => {
        table.dropIndex('status');
        table.dropIndex('transactionKind');
    });
}
