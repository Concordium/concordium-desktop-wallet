import { Setting, SettingGroup, Settings } from '../utils/types';
import ipcCommands from '../constants/ipcCommands.json';
import {
    settingsGroupTable,
    settingsTable,
} from '../constants/databaseNames.json';

/**
 * A select all from the setting table.
 */
export async function getAllSettings(): Promise<Setting[]> {
    return window.ipcRenderer.invoke(ipcCommands.dbSelectAll, settingsTable);
}

/**
 * A select all from the setting group table.
 */
export async function getSettingGroups(): Promise<SettingGroup[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.dbSelectAll,
        settingsGroupTable
    );
}

export async function updateEntry(setting: Setting) {
    return window.ipcRenderer.invoke('dbUpdateSettingsEntry', setting);
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
