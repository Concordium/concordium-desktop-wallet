import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable('setting_group', (table: Knex.TableBuilder) => {
            table.increments('id');
            table.string('name').unique();
        })
        .createTable('setting', (table: Knex.TableBuilder) => {
            table.increments('id');
            table.string('name').unique();
            table.string('type');
            table.string('value');
            table
                .integer('group')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('setting_group')
                .index();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('setting').dropTable('setting_group');
}
