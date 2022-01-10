import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        databaseNames.walletTable,
        (table: Knex.TableBuilder) => {
            table.increments('id');
            table.string('identifier').unique().notNullable();
            table.string('type').notNullable();
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(databaseNames.walletTable);
}
