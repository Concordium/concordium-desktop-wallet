import { Setting } from '~/utils/types';
import { settingsTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import { SettingsMethods } from '~/preload/preloadTypes';

async function updateEntry(setting: Setting) {
    return (await knex())(settingsTable)
        .where({ name: setting.name })
        .update(setting);
}

const exposedMethods: SettingsMethods = {
    update: updateEntry,
};
export default exposedMethods;
