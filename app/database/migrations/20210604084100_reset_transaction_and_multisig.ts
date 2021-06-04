/* eslint-disable */
import { Knex } from 'knex';
import {
    transactionTable,
    multiSignatureProposalTable,
} from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    await knex.table(transactionTable).del();
    await knex.table(multiSignatureProposalTable).del();
}

export async function down(_knex: Knex): Promise<void> {}
