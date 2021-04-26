import * as Knex from 'knex';
import { hwWalletTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        hwWalletTable,
        (table: Knex.TableBuilder) => {
            table.string('identifier').unique().index();
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(hwWalletTable);
}
