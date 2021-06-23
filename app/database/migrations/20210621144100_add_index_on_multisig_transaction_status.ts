/* eslint-disable */
import { Knex } from 'knex';
import { multiSignatureProposalTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(multiSignatureProposalTable, (table) => table.index('status'));
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable(multiSignatureProposalTable, (table) => table.dropIndex('status'));
}
