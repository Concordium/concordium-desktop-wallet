import * as Knex from 'knex';
import {
    identitiesTable,
    credentialsTable,
} from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        credentialsTable,
        (table: Knex.TableBuilder) => {
            table.string('accountAddress');
            table.string('credId').primary();
            table.boolean('external');
            table.integer('credentialNumber');
            table.integer('credentialIndex');

            table.integer('identityId');
            table.string('hwWallet');
            table
                .foreign(['identityId', 'hwWallet'])
                .references(['id', 'hwWallet'])
                .inTable(identitiesTable);

            table.json('policy');
            table.unique(['credentialIndex', 'accountAddress']);
            table.unique(['credentialNumber', 'identityId']);
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(credentialsTable);
}
