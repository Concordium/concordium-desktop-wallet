import { BlockSummary, ConsensusStatus } from '@concordium/node-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { getBlockSummary, getConsensusStatus } from '~/node/nodeRequests';

interface ChainDataState {
    blockSummary?: BlockSummary;
    consensusStatus?: ConsensusStatus;
}

const initialState: ChainDataState = {};

const chainDataSlice = createSlice({
    name: 'chainData',
    initialState,
    reducers: {
        setBlockSummary(state, input: PayloadAction<BlockSummary>) {
            state.blockSummary = input.payload;
        },
        setConsensusStatus(state, input: PayloadAction<ConsensusStatus>) {
            state.consensusStatus = input.payload;
        },
    },
});

export const { setBlockSummary, setConsensusStatus } = chainDataSlice.actions;

export async function init(dispatch: Dispatch) {
    try {
        const cs: ConsensusStatus = await getConsensusStatus();
        const bs = await getBlockSummary(cs.lastFinalizedBlock);

        dispatch(setConsensusStatus(cs));
        dispatch(setBlockSummary(bs));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Could initialize chain data state:', e); // TODO add proper logging instead
    }
}

export default chainDataSlice.reducer;
