import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.table('setting').insert([
        { name: 'foundationTransactionsEnabled', value: 'false', group: '1' },
        { name: 'setting1', value: 'false', group: '1' },
        { name: 'setting2', value: 'false', group: '1' },
        { name: 'setting3', value: 'false', group: '2' },
        { name: 'setting4', value: 'false', group: '3' },
    ]);
}

export async function down(knex: Knex): Promise<void> {
    return knex.table('setting').del();
}
