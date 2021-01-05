import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        settings: [],
        chosenSetting: undefined,
    },
    reducers: {
        chooseSetting: (state, index) => {
            state.chosenSetting = index.payload;
        },
        updateSettings: (state, index) => {
            state.settings = index.payload;
        },
    },
});

export const settingsSelector = (state: RootState) => state.settings.settings;

export const chosenSettingSelector = (state: RootState) =>
    state.settings.chosenSetting;

export const { chooseSetting, updateSettings } = settingsSlice.actions;

export async function selectSettings(dispatch: Dispatch, setting) {
    dispatch(chooseSetting(setting));
}

export default settingsSlice.reducer;
