/* eslint-disable */
import { Knex } from 'knex';
import { globalTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.table(globalTable).del();
}

export async function down(_knex: Knex): Promise<void> {}
