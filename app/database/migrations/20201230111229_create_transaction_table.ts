import * as Knex from 'knex';
import { transactionTable } from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        transactionTable,
        (table: Knex.TableBuilder) => {
            // Type Fields
            table.boolean('remote');
            table.string('originType');
            table.string('transactionKind');
            // Always present from proxy
            table.integer('id').unique();
            table.string('blockHash');
            table.string('blockTime');
            table.string('total');
            table.boolean('success'); // outcome: success/reject
            // Optionals
            table.string('transactionHash');
            table.string('subtotal');
            table.string('cost');
            table.integer('energy');
            // Blobs:
            table.json('origin');
            table.json('details');
            table.json('encrypted');
            // Others
            table.string('fromAddress').index();
            table.string('toAddress').index();
            table.string('status'); // TODO: make into enum? (received, absent, comitted, finalized)
            table.string('rejectReason');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(transactionTable);
}
