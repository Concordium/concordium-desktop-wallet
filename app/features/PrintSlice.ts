import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '~/store/store';

interface PrintState {
    isPrinting: boolean;
}

const printSlice = createSlice({
    name: 'print',
    initialState: {
        isPrinting: false,
    } as PrintState,
    reducers: {
        setPrinting: (state, index) => {
            state.isPrinting = index.payload;
        },
    },
});

export const isPrintingSelector = (state: RootState) => state.print.isPrinting;
export const { setPrinting } = printSlice.actions;

export default printSlice.reducer;
