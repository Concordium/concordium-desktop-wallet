import { Knex } from 'knex';
import {
    accountsTable,
    identitiesTable,
    transactionTable,
} from '~/constants/databaseNames.json';
import { Account } from '~/utils/types';

const TEMP_NAME = 'accounts_temp';
const insertChunkSize = 100;

function stringifyMaxTransactionId(accounts: Account[]): Account[] {
    return accounts.map((a) => ({
        ...a,
        maxTransactionId: '0',
    }));
}

function createCommonFields(table: Knex.CreateTableBuilder) {
    table
        .integer('identityId')
        .references('id')
        .inTable(identitiesTable)
        .notNullable();
    table.string('name');
    table.string('status');
    table.string('address').primary();
    table.integer('signatureThreshold');
    table.string('incomingAmounts').defaultTo('[]');
    table.string('selfAmounts').defaultTo('');
    table.string('totalDecrypted').defaultTo('');
    table.boolean('allDecrypted').defaultTo(true);
    table.string('deploymentTransactionId').defaultTo('0');
    table.boolean('isInitial').defaultTo(false);
    table.string('rewardFilter').defaultTo('[]');
}

export async function up(knex: Knex): Promise<void> {
    await knex.raw('PRAGMA foreign_keys=off;');

    await knex.transaction(async (t) => {
        await t.schema.renameTable(accountsTable, TEMP_NAME);
        await t.schema.createTable(accountsTable, (table) => {
            createCommonFields(table);
            table.string('maxTransactionId').defaultTo('0');
        });

        const accounts: Account[] = await t(TEMP_NAME).select();

        if (accounts.length) {
            await t.batchInsert(
                accountsTable,
                stringifyMaxTransactionId(accounts),
                insertChunkSize
            );
        }
        await knex.table(transactionTable).del();

        await knex.schema.dropTableIfExists(TEMP_NAME);
    });

    await knex.raw('PRAGMA foreign_keys=on;');
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw('PRAGMA foreign_keys=off;');

    await knex.transaction(async (t) => {
        await t.schema.renameTable(accountsTable, TEMP_NAME);
        await t.schema.createTable(accountsTable, (table) => {
            createCommonFields(table);
            table.integer('maxTransactionId').defaultTo(0);
        });

        const accounts: Account[] = await t(TEMP_NAME).select();

        await knex.table(transactionTable).del();

        if (accounts.length) {
            await t.batchInsert(
                accountsTable,
                accounts.map((a) => ({
                    ...a,
                    maxTransactionId: 0,
                })),
                insertChunkSize
            );
        }

        await knex.schema.dropTableIfExists(TEMP_NAME);
    });

    await knex.raw('PRAGMA foreign_keys=on;');
}
