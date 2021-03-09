import * as Knex from 'knex';
import {
    identitiesTable,
    credentialsTable,
} from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        credentialsTable,
        (table: Knex.TableBuilder) => {
            table.string('accountAddress');
            table.string('credId');
            table.integer('credentialNumber');
            table
                .integer('identityId')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable(identitiesTable)
                .index();
            table.json('arData');
            table.json('credentialPublicKeys');
            table.json('policy');
            table.integer('IpIdentity');
            table.integer('revocationThreshold');
            table.string('proofs');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(credentialsTable);
}
