import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { getGlobal } from '../utils/httpRequests';
import { Global } from '../utils/types';

interface GlobalState {
    globalObject: Global | undefined;
}

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        globalObject: undefined,
    } as GlobalState,
    reducers: {
        setGlobal: (state, input) => {
            state.globalObject = input.payload;
        },
    },
});

export const globalSelector = (state: RootState) => state.global.globalObject;
const { setGlobal } = globalSlice.actions;

export async function loadGlobal(dispatch: Dispatch) {
    // TODO Cache the global object
    const global = await getGlobal();
    dispatch(setGlobal(global));
}

export default globalSlice.reducer;
