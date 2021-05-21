import { Knex } from 'knex';
import {
    walletTable,
    identitiesTable,
} from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        identitiesTable,
        (table: Knex.TableBuilder) => {
            table.increments('id');
            table.integer('identityNumber');
            table.string('name');
            table.string('status');
            table.string('detail');
            table.string('codeUri');
            table.string('identityProvider');
            table.string('identityObject');
            table.string('randomness');
            table
                .integer('walletId')
                .references('id')
                .inTable(walletTable)
                .notNullable();
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(identitiesTable);
}
