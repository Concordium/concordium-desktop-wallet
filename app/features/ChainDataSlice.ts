import {
    ConsensusStatus,
    ConsensusStatusV0,
    KeysMatching,
} from '@concordium/node-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { getConsensusStatus } from '~/node/nodeRequests';
import type { RootState } from '~/store/store';
import { pipe } from '~/utils/basicHelpers';
import { orUndefined } from '~/utils/functionHelpers';

// TODO test this with v0 and v1
// TODO save concordiumBFTStatus?

type CSDateKey = KeysMatching<ConsensusStatusV0, Date>;
type CSBigIntKey = KeysMatching<ConsensusStatusV0, bigint>;

type SerializableConsensusStatus = Omit<
    ConsensusStatus,
    keyof CSDateKey | keyof CSBigIntKey | 'concordiumBFTStatus'
> &
    { [P in keyof CSDateKey]: number } &
    { [P in keyof CSBigIntKey]: string };

function toSerializableCS(cs: ConsensusStatus): SerializableConsensusStatus {
    return Object.entries(cs).reduce((acc, [key, value]) => {
        if (key === 'concordiumBFTStatus') {
            return acc;
        }
        if (typeof value === 'bigint') {
            return { ...acc, [key]: value.toString() };
        }
        if (value instanceof Date) {
            return { ...acc, [key]: value.getTime() };
        }
        return { ...acc, [key]: value };
    }, {} as SerializableConsensusStatus);
}

const csDates: CSDateKey[] = ['genesisTime', 'currentEraGenesisTime'];
const csBigInts: CSBigIntKey[] = [
    'epochDuration',
    'slotDuration',
    'bestBlockHeight',
    'lastFinalizedBlockHeight',
    'finalizationCount',
    'blocksVerifiedCount',
    'blocksReceivedCount',
    'protocolVersion',
];

function toOriginalCS(scs: SerializableConsensusStatus): ConsensusStatus {
    return Object.entries(scs).reduce((acc, [key, value]) => {
        if (
            (csBigInts as string[]).includes(key) &&
            typeof value === 'string'
        ) {
            return { ...acc, [key]: BigInt(value) };
        }
        if ((csDates as string[]).includes(key) && typeof value === 'number') {
            return { ...acc, [key]: new Date(value) };
        }
        return { ...acc, [key]: value };
    }, {} as ConsensusStatus);
}

interface ChainDataState {
    consensusStatus?: SerializableConsensusStatus;
}

const initialState: ChainDataState = {};

const chainDataSlice = createSlice({
    name: 'chainData',
    initialState,
    reducers: {
        setConsensusStatus(
            state,
            input: PayloadAction<SerializableConsensusStatus>
        ) {
            state.consensusStatus = input.payload;
        },
    },
});

export const setConsensusStatus = pipe(
    toSerializableCS,
    chainDataSlice.actions.setConsensusStatus
);

export const consensusStatusSelector = (s: RootState) =>
    orUndefined(toOriginalCS)(s.chainData.consensusStatus);

export async function init(dispatch: Dispatch) {
    try {
        const cs: ConsensusStatus = await getConsensusStatus();

        dispatch(setConsensusStatus(cs));
    } catch (e) {
        window.log.error(e as Error, 'Could not initialize chain data state');
    }
}

export default chainDataSlice.reducer;
