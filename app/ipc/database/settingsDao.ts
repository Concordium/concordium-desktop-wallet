import { Setting } from '~/utils/types';
import { settingsTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import { SettingsMethods } from '~/preloadTypes';

async function updateEntry(setting: Setting) {
    return (await knex())(settingsTable)
        .where({ name: setting.name })
        .update(setting);
}

const initializeIpcHandlers: SettingsMethods = {
    update: updateEntry,
};
export default initializeIpcHandlers;
