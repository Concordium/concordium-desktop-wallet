import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';
import { Preference, PreferenceKey } from '../types';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(databaseNames.preferencesTable, (table) => {
        table.string('key').primary();
        table.string('value').nullable();
    });

    const initialPreferences: Preference[] = [
        { key: PreferenceKey.DEFAULT_ACCOUNT, value: null },
        {
            key: PreferenceKey.ACCOUNT_PAGE_SIMPLE,
            value: JSON.stringify(true),
        },
    ];

    await knex.batchInsert(databaseNames.preferencesTable, initialPreferences);

    await knex.schema.alterTable(databaseNames.accountsTable, (table) => {
        table.dropColumn('rewardFilter');
    });

    return knex.schema.alterTable(databaseNames.accountsTable, (table) => {
        table.string('transactionFilter').defaultTo('{}');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable(databaseNames.preferencesTable);

    await knex.schema.alterTable(databaseNames.accountsTable, (table) => {
        table.dropColumn('transactionFilter');
    });
    return knex.schema.alterTable(databaseNames.accountsTable, (table) => {
        table.string('rewardFilter').defaultTo('[]');
    });
}
