import { createSlice } from '@reduxjs/toolkit';
import { MultiSignatureMenuItems } from '../components/multisig/MultiSignatureList';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

type MultiSignatureSliceState = {
    chosenMenu: MultiSignatureMenuItems
}

const multiSignatureSlice = createSlice({    
    name: 'multisignature',
    initialState: {
        chosenMenu: MultiSignatureMenuItems.MakeNewProposal,
    } as MultiSignatureSliceState,
    reducers: {
        chooseMenuItem: (state, input) => {
            state.chosenMenu = MultiSignatureMenuItems[input.payload];
        },
    },
});

export const {
    chooseMenuItem
} = multiSignatureSlice.actions;

export const chosenMenuSelector = (state: RootState) => 
    state.multisignature.chosenMenu;

export default multiSignatureSlice.reducer;
