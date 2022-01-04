import { Knex } from 'knex';
import databaseNames from '~/constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        databaseNames.genesisTable,
        (table: Knex.TableBuilder) => {
            table.increments('id');
            table.string('genesisBlock').unique().notNullable();
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(databaseNames.genesisTable);
}
