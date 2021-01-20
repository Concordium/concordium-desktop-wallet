import * as Knex from 'knex';
import {
    accountsTable,
    transactionTable,
} from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .table(accountsTable, (table) => {
            table.string('incomingAmounts').defaultTo('[]');
            table.string('selfAmounts').defaultTo('');
            table.integer('totalDecrypted').defaultTo('');
            table.boolean('allDecrypted').defaultTo(true);
        })
        .table(transactionTable, (table) => {
            table.integer('decryptedAmount');
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .table(accountsTable, (table) => {
            table.dropColumn('incomingAmounts');
            table.dropColumn('selfAmounts');
            table.dropColumn('totalDecrypted');
            table.dropColumn('allDecrypted');
        })
        .table(transactionTable, (table) => {
            table.dropColumn('decryptedAmount');
        });
}
