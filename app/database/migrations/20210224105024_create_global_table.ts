import * as Knex from 'knex';
import { globalTable } from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(globalTable, (table: Knex.TableBuilder) => {
        table.string('onChainCommitmentKey');
        table.string('bulletproofGenerators');
        table.string('genesisString');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(globalTable);
}
