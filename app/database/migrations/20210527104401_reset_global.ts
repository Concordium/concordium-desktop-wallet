/* eslint-disable */
import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.table(databaseNames.globalTable).del();
}

export async function down(_knex: Knex): Promise<void> {}
