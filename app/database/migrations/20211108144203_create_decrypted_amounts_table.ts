import { Knex } from 'knex';
import { decryptedAmountsTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(decryptedAmountsTable, (table) => {
        table.string('transactionHash').primary();
        table.string('amount').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(decryptedAmountsTable);
}
