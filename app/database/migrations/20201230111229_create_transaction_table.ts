import * as Knex from 'knex';
import { transactionTable } from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        transactionTable,
        (table: Knex.TableBuilder) => {
            table.string('sender');
            table.string('transaction');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(accountsTable);
}
