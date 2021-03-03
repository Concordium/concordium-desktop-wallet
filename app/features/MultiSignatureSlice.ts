import { createSlice, Dispatch } from '@reduxjs/toolkit';
import { getAll, updateEntry } from '../database/MultiSignatureProposalDao';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import {
    MultiSignatureMenuItems,
    MultiSignatureTransaction,
} from '../utils/types';

type MultiSignatureSliceState = {
    chosenMenu: MultiSignatureMenuItems;
    currentProposal: MultiSignatureTransaction | undefined;
    proposals: MultiSignatureTransaction[];
};

const multiSignatureSlice = createSlice({
    name: 'multisignature',
    initialState: {
        chosenMenu: MultiSignatureMenuItems.MakeNewProposal,
        currentProposal: undefined,
        proposals: [],
    } as MultiSignatureSliceState,
    reducers: {
        chooseMenuItem: (state, input) => {
            state.chosenMenu =
                MultiSignatureMenuItems[
                    input.payload as keyof typeof MultiSignatureMenuItems
                ];
        },
        setCurrentProposal: (state, input) => {
            state.currentProposal = input.payload;
        },
        setProposals: (state, input) => {
            state.proposals = input.payload;
        },
        updateProposals: (state, input) => {
            state.proposals = state.proposals.map((item) => {
                if (item.id !== input.payload.id) {
                    return item;
                }
                return input.payload;
            });
        },
    },
});

export const {
    chooseMenuItem,
    setCurrentProposal,
    setProposals,
    updateProposals,
} = multiSignatureSlice.actions;

export const chosenMenuSelector = (state: RootState) =>
    state.multisignature.chosenMenu;

export const currentProposalSelector = (state: RootState) =>
    state.multisignature.currentProposal;

export const proposalsSelector = (state: RootState) =>
    state.multisignature.proposals;

/**
 * Updates the multi signature transaction in the database, and updates the
 * state with the updated transaction.
 */
export async function updateCurrentProposal(
    dispatch: Dispatch,
    multiSignatureTransactionProposal: MultiSignatureTransaction
) {
    updateEntry(multiSignatureTransactionProposal);
    dispatch(setCurrentProposal(multiSignatureTransactionProposal));
    dispatch(updateProposals(multiSignatureTransactionProposal));
}

/**
 * Loads all proposals from the database and sets the state to be
 * exactly what was loaded from the database
 */
export async function loadProposals(dispatch: Dispatch) {
    const allProposals = await getAll();
    dispatch(setProposals(allProposals));
}

export default multiSignatureSlice.reducer;
