import * as Knex from 'knex';
import { accountsTable } from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        accountsTable,
        (table: Knex.TableBuilder) => {
            table.integer('accountNumber');
            table.string('name');
            table.string('status');
            table.string('address');
            table.string('identityName');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(accountsTable);
}
