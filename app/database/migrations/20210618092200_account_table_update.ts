import { Knex } from 'knex';
import {
    accountsTable,
    identitiesTable,
    transactionTable,
} from '~/constants/databaseNames.json';
import { ADDRESS_LENGTH } from '~/utils/accountHelpers';
import { Account } from '~/utils/types';

const TEMP_NAME = 'accounts_temp';
const insertChunkSize = 100;

// stringifies MaxTransactionId and ensures unique Account Address
function upAccounts(accounts: Account[]): Account[] {
    return accounts.map((a, i) => ({
        ...a,
        maxTransactionId: '0',
        address: a.address || `${i}`,
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
    await knex.transaction(async (t) => {
        await t.schema.createTable(TEMP_NAME, (table) => {
            createCommonFields(table);
            table.string('address').primary();
            table.string('maxTransactionId').defaultTo('0');
        });

        const accounts: Account[] = await t(accountsTable).select();

        if (accounts.length) {
            await t.batchInsert(
                TEMP_NAME,
                upAccounts(accounts),
                insertChunkSize
            );
        }
        await t.table(transactionTable).del();

        await t.schema.dropTableIfExists(accountsTable);
        await t.schema.renameTable(TEMP_NAME, accountsTable);
    });
}

type AccountWithNumberMaxTransactionId = Omit<Account, 'maxTransactionId'>;

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
            table.string('address');
            table.integer('maxTransactionId').defaultTo(0);
        });

        const accounts: Account[] = await t(accountsTable).select();

        if (accounts.length) {
            await t.batchInsert(
                TEMP_NAME,
                downAccounts(accounts),
                insertChunkSize
            );
        }

        await t.table(transactionTable).del();

        await t.schema.dropTableIfExists(accountsTable);
        await t.schema.renameTable(TEMP_NAME, accountsTable);
    });
}
