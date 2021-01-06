import * as Knex from 'knex';
import { addressBookTable } from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        addressBookTable,
        (table: Knex.TableBuilder) => {
            table.string('name');
            table.string('address').unique();
            table.string('note');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(addressBookTable);
}
