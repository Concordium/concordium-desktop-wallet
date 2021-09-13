import { Knex } from 'knex';
import { SettingTypeEnum } from '../../utils/types';
import settingKeys from '../../constants/settingKeys.json';

export async function up(knex: Knex): Promise<void> {
    return knex.table('setting').insert({
        name: settingKeys.showMemoWarning,
        type: SettingTypeEnum.Boolean,
        value: '1',
        group: '1',
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex
        .table('setting')
        .where({ name: settingKeys.showMemoWarning })
        .del();
}
