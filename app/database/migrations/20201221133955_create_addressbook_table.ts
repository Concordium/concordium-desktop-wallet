import { Knex } from 'knex';
import databaseNames from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        databaseNames.addressBookTable,
        (table: Knex.TableBuilder) => {
            table.string('name');
            table.string('address', 50).unique();
            table.string('note');
            table.boolean('readOnly').defaultTo(false);
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(databaseNames.addressBookTable);
}
