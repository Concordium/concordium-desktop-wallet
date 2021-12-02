import { Setting, SettingGroup, Settings } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';

/**
 * A select all from the setting table.
 */
export async function getAllSettings(): Promise<Setting[]> {
    return window.database.general.selectAll(databaseNames.settingsTable);
}

/**
 * A select all from the setting group table.
 */
export async function getSettingGroups(): Promise<SettingGroup[]> {
    return window.database.general.selectAll(databaseNames.settingsGroupTable);
}

/**
 * Loads all settings from the database. This includes loading the setting groups
 * to correctly group together related settings.
 */
export async function loadAllSettings(): Promise<Settings[]> {
    const allSettings: Setting[] = await getAllSettings();
    const settingGroups: SettingGroup[] = await getSettingGroups();

    const settings: Settings[] = settingGroups.map((group) => {
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

export const { update: updateEntry } = window.database.settings;
