import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        databaseNames.credentialsTable,
        (table: Knex.TableBuilder) => {
            table
                .integer('identityId')
                .references('id')
                .inTable(databaseNames.identitiesTable)
                .notNullable();
            table.string('accountAddress');
            table.string('credId').primary();
            table.integer('credentialNumber');
            table.integer('credentialIndex');
            table.json('policy');
            table.unique(['credentialIndex', 'accountAddress']);
            table.unique(['credentialNumber', 'identityId']);
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(databaseNames.credentialsTable);
}
