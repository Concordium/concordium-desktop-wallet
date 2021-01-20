import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(
        'multi_signature_proposal',
        (table: Knex.TableBuilder) => {
            table.increments('id');
            table.string('transaction');
            table.integer('threshold');
            table.string('status');
        }
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('multi_signature_proposal');
}
