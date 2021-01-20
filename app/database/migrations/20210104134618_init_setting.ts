import * as Knex from 'knex';
import { SettingTypeEnum } from '../../utils/types';

export async function up(knex: Knex): Promise<void> {
    return knex.table('setting').insert([
        {
            name: 'foundationTransactionsEnabled',
            type: SettingTypeEnum.Boolean,
            value: '0',
            group: '1',
        },
        {
            name: 'setting1',
            type: SettingTypeEnum.Text,
            value: 'false',
            group: '1',
        },
        {
            name: 'setting2',
            type: SettingTypeEnum.Text,
            value: 'false',
            group: '1',
        },
        {
            name: 'Node location',
            type: SettingTypeEnum.Text,
            value: '127.0.0.1:5100',
            group: '2',
        },
        {
            name: 'setting4',
            type: SettingTypeEnum.Text,
            value: 'false',
            group: '3',
        },
    ]);
}

export async function down(knex: Knex): Promise<void> {
    return knex.table('setting').del();
}
