import { Knex } from 'knex';
import { accountsTable, identitiesTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        accountsTable,
        (table: Knex.TableBuilder) => {
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
            table.integer('rewardFilter');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(accountsTable);
}
