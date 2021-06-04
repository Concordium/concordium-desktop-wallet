/* eslint-disable */
import { Knex } from 'knex';
import { transactionTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.table(transactionTable).del();
}

export async function down(_knex: Knex): Promise<void> {}
