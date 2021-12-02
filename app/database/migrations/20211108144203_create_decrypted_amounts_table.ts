import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async (t) => {
        // Create the new table for holding decrypted amounts, so that the user
        // does not have to decrypt them multiple times.
        await t.schema.createTable(
            databaseNames.decryptedAmountsTable,
            (table) => {
                table.string('transactionHash').primary();
                table.string('amount').notNullable();
            }
        );

        // Remove the maxTransactionId as we no longer need it when we retrieve
        // transactions from the wallet proxy, instead of having a local copy.
        await t.schema.alterTable(databaseNames.accountsTable, (table) => {
            table.dropColumn('maxTransactionId');
        });

        // Delete all transactions as we now retrieve transactions from the wallet proxy,
        // instead of keeping a local copy of all of them.
        await t.table(databaseNames.transactionTable).del();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.transaction(async (t) => {
        await t.schema.dropTable(databaseNames.decryptedAmountsTable);
        await t.schema.alterTable(databaseNames.accountsTable, (table) => {
            table.string('maxTransactionId').defaultTo('0').notNullable();
        });
    });
}
