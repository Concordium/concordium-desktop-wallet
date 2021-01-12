import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex
        .table('setting_group')
        .insert([{ name: 'multisig' }, { name: 'node' }, { name: 'other' }]);
}

export async function down(knex: Knex): Promise<void> {
    return knex.table('setting_group').del();
}
