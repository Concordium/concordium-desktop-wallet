import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { fetchGlobal } from '../utils/nodeHelpers';
import {
    getGlobal,
    setGlobal as setGlobalInDatabase,
} from '../database/GlobalDao';
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
const { setGlobal: setGlobalInState } = globalSlice.actions;

export async function loadGlobal(dispatch: Dispatch, blockHash?: string) {
    let global: Global | undefined = await getGlobal(); // load from storage
    if (!global) {
        try {
            global = await fetchGlobal(blockHash); // fetch remote
            setGlobalInDatabase(global); // store locally
        } catch (e) {
            return;
        }
    }
    dispatch(setGlobalInState(global));
}

export default globalSlice.reducer;
