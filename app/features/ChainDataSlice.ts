/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    BlockHash,
    ConsensusStatus,
    ConsensusStatusCommon,
    Duration,
} from '@concordium/web-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';
import { getConsensusStatus } from '~/node/nodeRequests';
import type { RootState } from '~/store/store';
import { pipe } from '~/utils/basicHelpers';
import { orUndefined } from '~/utils/functionHelpers';

interface SerializableConsensusStatus {
    version: number;
    bestBlock: string;
    genesisBlock: string;
    currentEraGenesisBlock: string;
    lastFinalizedBlock: string;
    epochDuration: string;
    bestBlockHeight: string;
    lastFinalizedBlockHeight: string;
    finalizationCount: string;
    blocksVerifiedCount: string;
    blocksReceivedCount: string;
    blockArriveLatencyEMA: number;
    blockArriveLatencyEMSD: number;
    blockReceiveLatencyEMA: number;
    blockReceiveLatencyEMSD: number;
    transactionsPerBlockEMA: number;
    transactionsPerBlockEMSD: number;
    blockReceivePeriodEMA?: number;
    blockReceivePeriodEMSD?: number;
    blockArrivePeriodEMA?: number;
    blockArrivePeriodEMSD?: number;
    finalizationPeriodEMA?: number;
    finalizationPeriodEMSD?: number;
    genesisTime: number;
    currentEraGenesisTime: number;
    blockLastReceivedTime?: number;
    blockLastArrivedTime?: number;
    lastFinalizedTime?: number;
    genesisIndex: number;
    protocolVersion: string;
    slotDuration?: string;
    concordiumBFTStatus?: SerializableConcordiumBftStatus;
}

interface SerializableConcordiumBftStatus {
    currentTimeoutDuration: string;
    currentRound: string;
    currentEpoch: string;
    triggerBlockTime: number;
}

function toSerializableCS(cs: ConsensusStatus): SerializableConsensusStatus {
    const scs: SerializableConsensusStatus = {
        ...(cs as ConsensusStatusCommon),
        version: cs.version,
        bestBlock: BlockHash.toHexString(cs.bestBlock), // BlockHash.Type;
        genesisBlock: BlockHash.toHexString(cs.genesisBlock), // BlockHash.Type;
        currentEraGenesisBlock: BlockHash.toHexString(
            cs.currentEraGenesisBlock
        ), // BlockHash.Type;
        lastFinalizedBlock: BlockHash.toHexString(cs.lastFinalizedBlock), // BlockHash.Type;
        epochDuration: cs.epochDuration.value.toString(), // Duration.Type;
        bestBlockHeight: cs.bestBlockHeight.toString(), // bigint;
        lastFinalizedBlockHeight: cs.lastFinalizedBlockHeight.toString(), // bigint;
        finalizationCount: cs.finalizationCount.toString(), // bigint;
        blocksVerifiedCount: cs.blocksVerifiedCount.toString(), // bigint;
        blocksReceivedCount: cs.blocksReceivedCount.toString(), // bigint;
        genesisTime: cs.genesisTime.getTime(), // Date;
        currentEraGenesisTime: cs.currentEraGenesisTime.getTime(), // Date;
        blockLastReceivedTime: cs.blockLastReceivedTime?.getTime(), // Date;
        blockLastArrivedTime: cs.blockLastArrivedTime?.getTime(), // Date;
        lastFinalizedTime: cs.lastFinalizedTime?.getTime(), // Date;
        protocolVersion: cs.protocolVersion.toString(), // bigint;
    };

    // eslint-disable-next-line default-case
    switch (cs.version) {
        case 0: {
            scs.slotDuration = cs.slotDuration.toString();
            break;
        }
        case 1: {
            scs.concordiumBFTStatus = {
                ...cs.concordiumBFTStatus,
                currentTimeoutDuration: cs.concordiumBFTStatus.currentTimeoutDuration.value.toString(),
                currentEpoch: cs.concordiumBFTStatus.currentEpoch.toString(),
                currentRound: cs.concordiumBFTStatus.currentRound.toString(),
                triggerBlockTime: cs.concordiumBFTStatus.triggerBlockTime.getTime(),
            };
            break;
        }
    }
    return scs;
}

function toOriginalCS(scs: SerializableConsensusStatus): ConsensusStatus {
    const cs: ConsensusStatusCommon = {
        ...scs,
        bestBlock: BlockHash.fromHexString(scs.bestBlock), // BlockHash.Type;
        genesisBlock: BlockHash.fromHexString(scs.genesisBlock), // BlockHash.Type;
        currentEraGenesisBlock: BlockHash.fromHexString(
            scs.currentEraGenesisBlock
        ), // BlockHash.Type;
        lastFinalizedBlock: BlockHash.fromHexString(scs.lastFinalizedBlock), // BlockHash.Type;
        epochDuration: Duration.fromMillis(BigInt(scs.epochDuration)), // Duration.Type;
        bestBlockHeight: BigInt(scs.bestBlockHeight), // bigint;
        lastFinalizedBlockHeight: BigInt(scs.lastFinalizedBlockHeight), // bigint;
        finalizationCount: BigInt(scs.finalizationCount), // bigint;
        blocksVerifiedCount: BigInt(scs.blocksVerifiedCount), // bigint;
        blocksReceivedCount: BigInt(scs.blocksReceivedCount), // bigint;
        genesisTime: new Date(scs.genesisTime), // Date;
        currentEraGenesisTime: new Date(scs.currentEraGenesisTime), // Date;
        blockLastReceivedTime:
            scs.blockLastReceivedTime !== undefined
                ? new Date(scs.blockLastReceivedTime)
                : undefined, // Date;
        blockLastArrivedTime:
            scs.blockLastArrivedTime !== undefined
                ? new Date(scs.blockLastArrivedTime)
                : undefined, // Date;
        lastFinalizedTime:
            scs.lastFinalizedTime !== undefined
                ? new Date(scs.lastFinalizedTime)
                : undefined, // Date;
        protocolVersion: BigInt(scs.protocolVersion), // bigint;
    };

    // eslint-disable-next-line default-case
    switch (scs.version) {
        case 0: {
            return {
                version: 0,
                ...cs,
                slotDuration: Duration.fromMillis(BigInt(scs.slotDuration!)),
            };
        }
        case 1: {
            return {
                version: 1,
                ...cs,
                concordiumBFTStatus: {
                    currentTimeoutDuration: Duration.fromMillis(
                        BigInt(scs.concordiumBFTStatus!.currentTimeoutDuration)
                    ),
                    currentEpoch: BigInt(scs.concordiumBFTStatus!.currentEpoch),
                    currentRound: BigInt(scs.concordiumBFTStatus!.currentRound),
                    triggerBlockTime: new Date(
                        scs.concordiumBFTStatus!.triggerBlockTime
                    ),
                },
            };
        }
        default:
            throw new Error('Unhandled consensus status version');
    }
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
