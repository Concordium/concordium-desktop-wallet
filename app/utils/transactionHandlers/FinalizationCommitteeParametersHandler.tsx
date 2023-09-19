import React from 'react';
import { NextUpdateSequenceNumbers } from '@concordium/web-sdk';
import FinalizationCommitteeParametersView from '~/pages/multisig/updates/FinalizationCommitteeParameters/FinalizationCommitteeParametersView';
import UpdateFinalizationCommitteeParameters from '~/pages/multisig/updates/FinalizationCommitteeParameters/UpdateFinalizationCommitteeParameters';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, ChainParameters } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    isFinalizationCommitteeParameters,
    FinalizationCommitteeParameters,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeFinalizationCommitteeParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';
import { FinalizationCommitteeParametersFields } from '~/pages/multisig/updates/FinalizationCommitteeParameters/util';
import { assertChainParametersV2OrHigher } from '../blockSummaryHelpers';

const TYPE = 'Update finalization committee parameters';

type TransactionType = UpdateInstruction<FinalizationCommitteeParameters>;

export default class FinalizationCommitteeParametersHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isFinalizationCommitteeParameters);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        fields: FinalizationCommitteeParametersFields,
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

        const sequenceNumber =
            nextUpdateSequenceNumbers.finalizationCommiteeParameters;
        // This update shares authorization with the pool parameter update
        const { threshold } = chainParameters.level2Keys.poolParameters;

        return createUpdateMultiSignatureTransaction(
            fields,
            UpdateType.FinalizationCommitteeParameters,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeFinalizationCommitteeParameters(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signFinalizationCommitteeParameters(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <FinalizationCommitteeParametersView
                finalizationCommitteeParameters={transaction.payload}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        // This update shares authorization with the pool parameter update
        return authorizations.poolParameters;
    }

    update = UpdateFinalizationCommitteeParameters;
}
