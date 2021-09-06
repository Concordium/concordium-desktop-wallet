import { createSlice, Dispatch } from '@reduxjs/toolkit';
import { loadAllSettings, updateEntry } from '~/database/SettingsDao';
// eslint-disable-next-line import/no-cycle
import { RootState } from '~/store/store';
import { Setting, Settings } from '~/utils/types';
import settingKeys from '~/constants/settingKeys.json';

interface SettingsState {
    settings: Settings[];
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        settings: [],
    } as SettingsState,
    reducers: {
        updateSettings: (state, index) => {
            state.settings = index.payload;
        },
    },
});

/**
 * Searches the settings for a setting with the provided name.
 * @param name name of the setting to find
 * @param settings the settings to search
 */
export function findSetting(
    name: string,
    settings: Settings[]
): Setting | undefined {
    const flattenedSettings = settings.flatMap((settingTopLevel) => {
        return settingTopLevel.settings;
    });
    return flattenedSettings.find((setting) => setting.name === name);
}

export const foundationTransactionsEnabledSelector = (
    state: RootState
): boolean => {
    const result = findSetting(
        settingKeys.foundationTransactionsEnabled,
        state.settings.settings
    );
    if (result && result.value === '1') {
        return true;
    }
    return false;
};

export const showMemoWarningSelector = (state: RootState) => {
    return findSetting(settingKeys.showMemoWarning, state.settings.settings);
};

export const { updateSettings } = settingsSlice.actions;

/**
 * Updates the given Setting in the database, and dispatches an update to the state
 * with the updated settings from the database.
 * @param dispatch redux dispatch function
 * @param updatedEntry the Setting that has been updated
 */
export async function updateSettingEntry(
    dispatch: Dispatch,
    updatedEntry: Setting
) {
    await updateEntry(updatedEntry);
    const settings = await loadAllSettings();
    dispatch(updateSettings(settings));
}

export const settingsSelector = (state: RootState) => state.settings.settings;

export const specificSettingSelector = (settingName: string) => (
    state: RootState
) => findSetting(settingName, state.settings.settings);

export default settingsSlice.reducer;
