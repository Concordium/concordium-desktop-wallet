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
        await t.schema.createTable(TEMP_NAME, (table) => {
            createCommonFields(table);
            table.string('maxTransactionId').defaultTo('0');
        });

        const accounts: Account[] = await t(accountsTable).select();

        if (accounts.length) {
            await t.batchInsert(
                TEMP_NAME,
                stringifyMaxTransactionId(accounts),
                insertChunkSize
            );
        }

        const violations = await knex.raw('PRAGMA foreign_key_check;');
        if (violations.length > 1) {
            await t.rollback();
            throw new Error('Foreign key violations detected during migration');
        }

        await t.table(transactionTable).del();

        await t.schema.dropTableIfExists(accountsTable);
        await t.schema.renameTable(TEMP_NAME, accountsTable);
    });

    await knex.raw('PRAGMA foreign_keys=on;');
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw('PRAGMA foreign_keys=off;');

    await knex.transaction(async (t) => {
        await t.schema.createTable(TEMP_NAME, (table) => {
            createCommonFields(table);
            table.integer('maxTransactionId').defaultTo(0);
        });

        const accounts: Account[] = await t(accountsTable).select();

        if (accounts.length) {
            await t.batchInsert(
                TEMP_NAME,
                accounts.map((a) => ({
                    ...a,
                    maxTransactionId: 0,
                })),
                insertChunkSize
            );
        }

        const violations = await knex.raw('PRAGMA foreign_key_check;');
        if (violations.length > 1) {
            await t.rollback();
            throw new Error('Foreign key violations detected during migration');
        }

        await t.table(transactionTable).del();

        await t.schema.dropTableIfExists(accountsTable);
        await t.schema.renameTable(TEMP_NAME, accountsTable);
    });

    await knex.raw('PRAGMA foreign_keys=on;');
}
