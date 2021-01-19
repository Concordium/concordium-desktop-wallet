import { createSlice, Dispatch } from '@reduxjs/toolkit';
import { MultiSignatureMenuItems } from '../components/multisig/MultiSignatureList';
import { MultiSignatureTransaction } from '../components/multisig/UpdateMicroGtuPerEuro';
import { getAll } from '../database/MultiSignatureProposalDao';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';


type MultiSignatureSliceState = {
    chosenMenu: MultiSignatureMenuItems;
    currentProposal?: MultiSignatureTransaction;
    proposals: MultiSignatureTransaction[],
}

const multiSignatureSlice = createSlice({    
    name: 'multisignature',
    initialState: {
        chosenMenu: MultiSignatureMenuItems.MakeNewProposal,
        currentProposal: undefined,
        proposals: []
    } as MultiSignatureSliceState,
    reducers: {
        chooseMenuItem: (state, input) => {
            state.chosenMenu = MultiSignatureMenuItems[input.payload];
        },
        setCurrentProposal: (state, input) => {
            state.currentProposal = input.payload;
        },
        setProposals: (state, input) => {
            state.proposals = input.payload;
        }
    },
});

export const {
    chooseMenuItem,
    setCurrentProposal,
    setProposals
} = multiSignatureSlice.actions;

export const chosenMenuSelector = (state: RootState) => 
    state.multisignature.chosenMenu;

export const currentProposalSelector = (state: RootState) => 
    state.multisignature.currentProposal;

export const proposalsSelector = (state: RootState) => 
    state.multisignature.proposals;

export async function updateCurrentProposal(
    dispatch: Dispatch,
    multiSignatureTransactionProposal: MultiSignatureTransaction
) {
    
    // Save the multi signature transaction to the database, so that it is also persisted.
    dispatch(setCurrentProposal(multiSignatureTransactionProposal));
}

export async function loadProposals(dispatch: Dispatch) {
    const allProposals = await getAll();
    console.log(allProposals);
    dispatch(setProposals(allProposals));
}

export default multiSignatureSlice.reducer;

