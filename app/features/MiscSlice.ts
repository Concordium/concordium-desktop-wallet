import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { noOp } from '~/utils/basicHelpers';
import { hasAcceptedTerms, storeTerms } from '~/utils/termsHelpers';
import { NodeConnectionStatus } from '~/utils/types';

interface MiscState {
    termsAccepted: boolean;
    unlocked: boolean;
    isPrinting: boolean;
    nodeStatus: NodeConnectionStatus;
}

const initialState: MiscState = {
    termsAccepted: false,
    unlocked: false,
    isPrinting: false,
    nodeStatus: NodeConnectionStatus.Pinging,
};

const miscSlice = createSlice({
    name: 'misc',
    initialState,
    reducers: {
        acceptTerms(state, input) {
            state.termsAccepted = input.payload;
        },
        unlock(state) {
            state.unlocked = true;
        },
        setPrinting: (state, index) => {
            state.isPrinting = index.payload;
        },
        setNodeStatus(state, input: PayloadAction<NodeConnectionStatus>) {
            state.nodeStatus = input.payload;
        },
    },
});

export const { unlock, setPrinting, setNodeStatus } = miscSlice.actions;
const { acceptTerms: setTermsAccepted } = miscSlice.actions;

export async function init(dispatch: Dispatch) {
    const termsAccepted = await hasAcceptedTerms();

    if (termsAccepted) {
        dispatch(setTermsAccepted(true));
    }
}

export async function acceptTerms(dispatch: Dispatch) {
    try {
        await storeTerms();
        dispatch(setTermsAccepted(true));
    } catch {
        noOp();
    }
}

export default miscSlice.reducer;
