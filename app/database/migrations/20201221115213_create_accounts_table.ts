import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        databaseNames.accountsTable,
        (table: Knex.TableBuilder) => {
            table
                .integer('identityId')
                .references('id')
                .inTable(databaseNames.identitiesTable)
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
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(databaseNames.accountsTable);
}
