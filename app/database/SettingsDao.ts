import { Setting, SettingGroup, Settings } from '../utils/types';
import knex from './knex';

const settingsTable = 'setting';
const settingsGroupTable = 'setting_group';

/**
 * A select all from the setting table.
 */
export async function getAllSettings() {
    const settings: Setting[] = (await knex()).select().table(settingsTable);
    return settings;
}

/**
 * A select all from the setting group table.
 */
export async function getSettingGroups() {
    return (await knex()).select().table(settingsGroupTable);
}

export async function updateEntry(setting: Setting) {
    return (await knex())(settingsTable)
        .where({ name: setting.name })
        .update(setting);
}

/**
 * Loads all settings from the database. This includes loading the setting groups
 * to correctly group together related settings.
 */
export async function loadAllSettings() {
    const allSettings: Setting[] = await getAllSettings();
    const settingGroups: SettingGroup[] = await getSettingGroups();

    const settings = settingGroups.map((group) => {
        const resultSetting: Settings = {
            type: group.name,
            settings: allSettings.filter(
                (setting) => setting.group === group.id
            ),
        };
        return resultSetting;
    });

    return settings;
}
