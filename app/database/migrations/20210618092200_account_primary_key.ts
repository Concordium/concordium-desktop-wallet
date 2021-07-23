import { Knex } from 'knex';
import { accountsTable, identitiesTable } from '~/constants/databaseNames.json';
import { ADDRESS_LENGTH } from '~/utils/accountHelpers';
import { Account } from '~/utils/types';

const TEMP_NAME = 'accounts_temp';

function ensureUniqueAccountAddresses(accounts: Account[]): Account[] {
    return accounts.map((a, i) => ({ ...a, address: a.address || `${i}` }));
}

export async function up(knex: Knex): Promise<void> {
    await knex.raw('PRAGMA foreign_keys=off;');

    await knex.transaction(async (t) => {
        await t.schema.renameTable(accountsTable, TEMP_NAME);
        await t.schema.createTable(accountsTable, (table) => {
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
            table.integer('maxTransactionId').defaultTo(0);
            table.string('deploymentTransactionId');
            table.boolean('isInitial').defaultTo(false);
            table.string('rewardFilter').defaultTo('[]');
        });

        const accounts: Account[] = await t(TEMP_NAME).select();

        if (accounts.length) {
            await t.batchInsert(
                accountsTable,
                ensureUniqueAccountAddresses(accounts),
                100
            );
        }

        await knex.schema.dropTableIfExists(TEMP_NAME);
    });

    await knex.raw('PRAGMA foreign_keys=on;');
}

function revertTempAddresses(accounts: Account[]): Account[] {
    return accounts.map((a) => ({
        ...a,
        address: a.address.length !== ADDRESS_LENGTH ? '' : a.address,
    }));
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw('PRAGMA foreign_keys=off;');

    await knex.transaction(async (t) => {
        await t.schema.renameTable(accountsTable, TEMP_NAME);
        await t.schema.createTable(accountsTable, (table) => {
            table
                .integer('identityId')
                .references('id')
                .inTable(identitiesTable)
                .notNullable();
            table.string('name');
            table.string('status');
            table.string('address');
            table.integer('signatureThreshold');
            table.string('incomingAmounts').defaultTo('[]');
            table.string('selfAmounts').defaultTo('');
            table.string('totalDecrypted').defaultTo('');
            table.boolean('allDecrypted').defaultTo(true);
            table.integer('maxTransactionId').defaultTo(0);
            table.string('deploymentTransactionId');
            table.boolean('isInitial').defaultTo(false);
            table.string('rewardFilter').defaultTo('[]');
        });

        const accounts: Account[] = await t(TEMP_NAME).select();

        if (accounts.length) {
            await t.batchInsert(
                accountsTable,
                revertTempAddresses(accounts),
                100
            );
        }

        await knex.schema.dropTableIfExists(TEMP_NAME);
    });

    await knex.raw('PRAGMA foreign_keys=on;');
}
