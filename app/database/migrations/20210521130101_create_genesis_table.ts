import { Knex } from 'knex';
import { genesisTable } from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(genesisTable, (table: Knex.TableBuilder) => {
        table.increments('id');
        table.string('genesisBlock').unique().notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(genesisTable);
}
