import { createSlice, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import { getGlobal } from '../database/GlobalDao';
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

/**
 * Loads the global cryptographic parameters from the database into the
 * redux state. If the parameters have not yet been loaded from a node,
 * then the value will be undefined.
 */
export async function loadGlobal(dispatch: Dispatch) {
    const global: Global | undefined = await getGlobal();
    dispatch(setGlobalInState(global));
}

export default globalSlice.reducer;
