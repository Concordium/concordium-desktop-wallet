/* eslint-disable */
import { Knex } from 'knex';
import { multiSignatureProposalTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.table(multiSignatureProposalTable).del();
}

export async function down(_knex: Knex): Promise<void> {}
