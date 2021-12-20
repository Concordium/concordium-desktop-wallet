import { Knex } from 'knex';
import databaseNames from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        databaseNames.globalTable,
        (table: Knex.TableBuilder) => {
            table.string('onChainCommitmentKey');
            table.string('bulletproofGenerators');
            table.string('genesisString');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(databaseNames.globalTable);
}
