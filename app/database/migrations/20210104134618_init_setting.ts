import { Knex } from 'knex';
import { SettingTypeEnum } from '../../utils/types';
import settingKeys from '../../constants/settingKeys.json';

export async function up(knex: Knex): Promise<void> {
    return knex.table('setting').insert([
        {
            name: settingKeys.foundationTransactionsEnabled,
            type: SettingTypeEnum.Boolean,
            value: '0',
            group: '1',
        },
        {
            name: settingKeys.nodeLocation,
            type: SettingTypeEnum.Connection,
            value: JSON.stringify({
                address: '127.0.0.1',
                port: '10000',
            }),
            group: '2',
        },
        {
            name: settingKeys.password,
            type: SettingTypeEnum.Password,
            value: '',
            group: '3',
        },
    ]);
}

export async function down(knex: Knex): Promise<void> {
    return knex.table('setting').del();
}
