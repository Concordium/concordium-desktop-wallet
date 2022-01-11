import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';
import { ADDRESS_LENGTH } from '~/utils/accountHelpers';
import { Account } from '~/utils/types';

const TEMP_NAME = 'accounts_temp';
const insertChunkSize = 100;

/**
 * changes MaxTransactionId to a string and ensures unique Account Address
 */
function upAccounts(accounts: Account[]): Account[] {
    return accounts.map((a, i) => ({
        ...a,
        selfAmounts: a.selfAmounts || '',
        incomingAmounts: a.incomingAmounts || '[]',
        signatureThreshold: a.signatureThreshold || 1,
        totalDecrypted: a.totalDecrypted || '0',
        maxTransactionId: '0',
        address: a.address || `${i}`,
    }));
}

function createCommonFields(table: Knex.CreateTableBuilder) {
    table
        .integer('identityId')
        .references('id')
        .inTable(databaseNames.identitiesTable)
        .notNullable();
}

export async function up(knex: Knex): Promise<void> {
    await knex.transaction(async (t) => {
        await t.schema.createTable(TEMP_NAME, (table) => {
            createCommonFields(table);
            table.string('name').notNullable();
            table.string('status').notNullable();
            table.string('selfAmounts').defaultTo('').notNullable();
            table.string('incomingAmounts').defaultTo('[]').notNullable();
            table.integer('signatureThreshold').defaultTo(1).notNullable();
            table.string('totalDecrypted').defaultTo('0').notNullable();
            table.boolean('allDecrypted').defaultTo(true).notNullable();
            table.string('deploymentTransactionId');
            table.boolean('isInitial').defaultTo(false).notNullable();
            table.string('rewardFilter').defaultTo('[]').notNullable();

            table.string('address').primary();
            table.string('maxTransactionId').defaultTo('0').notNullable();
        });

        const accounts: Account[] = await t(
            databaseNames.accountsTable
        ).select();

        if (accounts.length) {
            await t.batchInsert(
                TEMP_NAME,
                upAccounts(accounts),
                insertChunkSize
            );
        }

        await t.schema.dropTableIfExists(databaseNames.accountsTable);
        await t.schema.renameTable(TEMP_NAME, databaseNames.accountsTable);

        await t.table(databaseNames.transactionTable).del();
    });
}

type AccountWithNumberMaxTransactionId = Omit<Account, 'maxTransactionId'> & {
    maxTransactionId: number;
};

/**
 * changes MaxTransactionId to a number and removes Account Address placeholders
 */
function downAccounts(
    accounts: Account[]
): AccountWithNumberMaxTransactionId[] {
    return accounts.map((a) => ({
        ...a,
        maxTransactionId: 0,
        address: a.address.length !== ADDRESS_LENGTH ? '' : a.address,
    }));
}

export async function down(knex: Knex): Promise<void> {
    await knex.transaction(async (t) => {
        await t.schema.createTable(TEMP_NAME, (table) => {
            createCommonFields(table);
            table.string('name');
            table.string('status');
            table.string('selfAmounts').defaultTo('');
            table.string('incomingAmounts').defaultTo('[]');
            table.integer('signatureThreshold');
            table.string('totalDecrypted').defaultTo('');
            table.boolean('allDecrypted').defaultTo(true);
            table.string('deploymentTransactionId').defaultTo('0');
            table.boolean('isInitial').defaultTo(false);
            table.string('rewardFilter').defaultTo('[]');

            table.string('address');
            table.integer('maxTransactionId').defaultTo(0);
        });

        const accounts: Account[] = await t(
            databaseNames.accountsTable
        ).select();

        if (accounts.length) {
            await t.batchInsert(
                TEMP_NAME,
                downAccounts(accounts),
                insertChunkSize
            );
        }
        await t.schema.dropTableIfExists(databaseNames.accountsTable);
        await t.schema.renameTable(TEMP_NAME, databaseNames.accountsTable);

        await t.table(databaseNames.transactionTable).del();
    });
}
