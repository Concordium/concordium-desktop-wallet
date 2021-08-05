import { createSlice, Dispatch } from '@reduxjs/toolkit';
import getMultiSigDao, {
    getAllProposals,
} from '../database/MultiSignatureProposalDao';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store/store';
import {
    MultiSignatureMenuItems,
    MultiSignatureTransaction,
} from '../utils/types';

type MultiSignatureSliceState = {
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
        addProposal: (state, input) => {
            state.proposals = [...state.proposals, input.payload];
        },
    },
});

export const {
    setProposals,
    updateProposals,
    addProposal,
} = multiSignatureSlice.actions;

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
    getMultiSigDao().update(multiSignatureTransactionProposal);
    dispatch(updateProposals(multiSignatureTransactionProposal));
}

/**
 * Loads all proposals from the database and sets the state to be
 * exactly what was loaded from the database
 */
export async function loadProposals(dispatch: Dispatch) {
    const allProposals = await getAllProposals();
    dispatch(setProposals(allProposals));
}

export default multiSignatureSlice.reducer;
