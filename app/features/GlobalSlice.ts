import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { fetchGlobal } from '../utils/httpRequests';
import { getGlobal, insertGlobal } from '../database/GlobalDao';
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
    let global: Global | undefined = await getGlobal(); // load from storage
    if (!global) {
        try {
            global = await fetchGlobal(); // fetch remote
            insertGlobal(global); // store locally
        } catch (e) {
            global = undefined; // everything failed
        }
    }
    dispatch(setGlobal(global));
}

export default globalSlice.reducer;
