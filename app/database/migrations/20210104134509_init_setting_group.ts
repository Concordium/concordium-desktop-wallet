import { Knex } from 'knex';
import settingKeys from '../../constants/settingKeys.json';

export async function up(knex: Knex): Promise<void> {
    return knex
        .table('setting_group')
        .insert([
            { name: 'multisig' },
            { name: settingKeys.nodeSettings },
            { name: settingKeys.passwordSettings },
        ]);
}

export async function down(knex: Knex): Promise<void> {
    return knex.table('setting_group').del();
}
