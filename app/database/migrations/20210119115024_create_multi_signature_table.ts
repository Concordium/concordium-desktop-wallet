import { Knex } from 'knex';
import databaseNames from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        databaseNames.multiSignatureProposalTable,
        (table: Knex.TableBuilder) => {
            table.increments('id');
            table.json('transaction');
            table.integer('threshold');
            table.string('status');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(databaseNames.multiSignatureProposalTable);
}
