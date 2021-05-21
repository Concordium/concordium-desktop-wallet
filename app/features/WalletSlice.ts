import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';

interface State {
    currentId: number | undefined;
}

const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        currentId: undefined,
    } as State,
    reducers: {
        setCurrentWalletId: (state, input) => {
            state.currentId = input.payload;
        },
    },
});

export const walletIdSelector = (state: RootState) => state.wallet.currentId;

export const { setCurrentWalletId } = walletSlice.actions;

export default walletSlice.reducer;
