import * as Knex from 'knex';
import { identitiesTable } from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        identitiesTable,
        (table: Knex.TableBuilder) => {
            table.increments('id');
            table.string('name');
            table.string('status');
            table.string('detail');
            table.string('codeUri');
            table.string('identityProvider');
            table.string('identityObject');
            table.string('privateIdObjectDataEncrypted');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(identitiesTable);
}
