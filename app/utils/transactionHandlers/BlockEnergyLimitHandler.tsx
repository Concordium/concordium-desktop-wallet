import React from 'react';
import { NextUpdateSequenceNumbers } from '@concordium/web-sdk';
import BlockEnergyLimitView from '~/pages/multisig/updates/BlockEnergyLimit/BlockEnergyLimitView';
import UpdateBlockEnergyLimit, {
    BlockEnergyLimitFields,
} from '~/pages/multisig/updates/BlockEnergyLimit/UpdateBlockEnergyLimit';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, ChainParameters } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    isBlockEnergyLimit,
    BlockEnergyLimit,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeBlockEnergyLimit } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';
import { assertChainParametersV2OrHigher } from '../blockSummaryHelpers';

const TYPE = 'Update block energy limit';

type TransactionType = UpdateInstruction<BlockEnergyLimit>;

export default class BlockEnergyLimitHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isBlockEnergyLimit);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { blockEnergyLimit }: BlockEnergyLimitFields,
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

        const sequenceNumber = nextUpdateSequenceNumbers.blockEnergyLimit;
        // ElectionDifficulty was removed when BlockEnergyLimit was added, and its index was repurposed for BlockEnergyLimit and other new updates.
        const { threshold } = chainParameters.level2Keys.electionDifficulty;

        return createUpdateMultiSignatureTransaction(
            { blockEnergyLimit: BigInt(blockEnergyLimit) },
            UpdateType.BlockEnergyLimit,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeBlockEnergyLimit(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signBlockEnergyLimit(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <BlockEnergyLimitView blockEnergyLimit={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.electionDifficulty;
    }

    update = UpdateBlockEnergyLimit;
}
