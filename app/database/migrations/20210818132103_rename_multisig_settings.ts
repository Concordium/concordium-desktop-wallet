import { Knex } from 'knex';
import settingKeys from '../../constants/settingKeys.json';
import { settingsGroupTable } from '../../constants/databaseNames.json';

export async function up(knex: Knex): Promise<void> {
    return knex
        .table(settingsGroupTable)
        .where({ name: 'multisig' })
        .update({ name: settingKeys.preferences });
}

export async function down(knex: Knex): Promise<void> {
    return knex
        .table(settingsGroupTable)
        .where({ name: settingKeys.preferences })
        .update({ name: 'multisig' });
}
