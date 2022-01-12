/* eslint-disable */
import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.transactionTable, (table) => {
        table.index(['toAddress', 'transactionKind', 'blockTime']);
        table.index(['fromAddress', 'transactionKind', 'blockTime']);
        table.index('status');
        table.index('transactionHash');
        table.dropIndex('toAddress');
        table.dropIndex('fromAddress');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(databaseNames.transactionTable, (table) => {
        table.dropIndex(['toAddress', 'transactionKind', 'blockTime']);
        table.dropIndex(['fromAddress', 'transactionKind', 'blockTime']);
        table.dropIndex('status');
        table.dropIndex('transactionHash');
        table.index('toAddress');
        table.index('fromAddress');
    });
}
