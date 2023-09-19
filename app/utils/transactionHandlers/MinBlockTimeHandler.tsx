import React from 'react';
import { NextUpdateSequenceNumbers } from '@concordium/web-sdk';
import MinBlockTimeView from '~/pages/multisig/updates/MinBlockTime/MinBlockTimeView';
import UpdateMinBlockTime, {
    MinBlockTimeFields,
} from '~/pages/multisig/updates/MinBlockTime/UpdateMinBlockTime';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, ChainParameters } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    isMinBlockTime,
    MinBlockTime,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeMinBlockTime } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';
import { assertChainParametersV2OrHigher } from '../blockSummaryHelpers';

const TYPE = 'Update minimum block time';

type TransactionType = UpdateInstruction<MinBlockTime>;

export default class MinBlockTimeHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isMinBlockTime);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { minBlockTime }: MinBlockTimeFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        assertChainParametersV2OrHigher(
            chainParameters,
            'Update incompatible with chain protocol version'
        );

        const sequenceNumber = nextUpdateSequenceNumbers.minBlockTime;
        const { threshold } = chainParameters.level2Keys.electionDifficulty;

        return createUpdateMultiSignatureTransaction(
            { minBlockTime: BigInt(minBlockTime) },
            UpdateType.MinBlockTime,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeMinBlockTime(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signMinBlockTime(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <MinBlockTimeView minBlockTime={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.electionDifficulty;
    }

    update = UpdateMinBlockTime;
}
