import { Knex } from 'knex';
import { accountsTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(accountsTable, (table) => {
        table.boolean('isFavourite').defaultTo(false);
        table.dropColumn('rewardFilter');
    });

    return knex.schema.alterTable(accountsTable, (table) => {
        table.string('rewardFilter').defaultTo('{}');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(accountsTable, (table) => {
        table.dropColumn('isFavourite');
        table.dropColumn('rewardFilter');
    });
    return knex.schema.alterTable(accountsTable, (table) => {
        table.string('rewardFilter').defaultTo('[]');
    });
}
