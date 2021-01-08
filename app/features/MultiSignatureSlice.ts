import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

const multiSignatureSlice = createSlice({    
    name: 'multisignature',
    initialState: {
        chosenMenu: undefined,
    },
    reducers: {
        chooseMenuItem: (state, input) => {
            state.chosenMenu = input.payload;
        },
    },
});

export const {
    chooseMenuItem
} = multiSignatureSlice.actions;

export const chosenMenuSelector = (state: RootState) => 
    state.multisignature.chosenMenu;

export default multiSignatureSlice.reducer;
