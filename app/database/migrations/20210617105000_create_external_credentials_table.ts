import { Knex } from 'knex';
import {
    externalCredentialsTable,
    accountsTable,
} from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(externalCredentialsTable, (table) => {
        table
            .string('address')
            .references('address')
            .inTable(accountsTable)
            .notNullable()
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.string('credId').primary();
        table.string('note').defaultTo('');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(externalCredentialsTable);
}
