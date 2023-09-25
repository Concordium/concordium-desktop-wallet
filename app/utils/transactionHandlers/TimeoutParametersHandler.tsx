import React from 'react';
import { NextUpdateSequenceNumbers } from '@concordium/web-sdk';
import TimeoutParametersView from '~/pages/multisig/updates/TimeoutParameters/TimeoutParametersView';
import UpdateTimeoutParameters from '~/pages/multisig/updates/TimeoutParameters/UpdateTimeoutParameters';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, ChainParameters } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    isTimeoutParameters,
    TimeoutParameters,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeTimeoutParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';
import { TimeoutParametersFields } from '~/pages/multisig/updates/TimeoutParameters/util';
import { assertChainParametersV2OrHigher } from '../blockSummaryHelpers';
import { getReducedFraction } from '../exchangeRateHelpers';

const TYPE = 'Update timeout parameters';

type TransactionType = UpdateInstruction<TimeoutParameters>;

export default class TimeoutParametersHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isTimeoutParameters);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        fields: TimeoutParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }
        assertChainParametersV2OrHigher(chainParameters);

        const sequenceNumber = nextUpdateSequenceNumbers.timeoutParameters;
        const { threshold } = chainParameters.level2Keys.electionDifficulty;

        const payload = {
            timeoutBase: fields.timeoutBase,
            timeoutIncrease: getReducedFraction({
                numerator: BigInt(fields.timeoutIncrease.numerator),
                denominator: BigInt(fields.timeoutIncrease.denominator),
            }),
            timeoutDecrease: getReducedFraction({
                numerator: BigInt(fields.timeoutDecrease.numerator),
                denominator: BigInt(fields.timeoutDecrease.denominator),
            }),
        };

        return createUpdateMultiSignatureTransaction(
            payload,
            UpdateType.TimeoutParameters,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeTimeoutParameters(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signTimeoutParameters(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <TimeoutParametersView timeoutParameters={transaction.payload} />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.electionDifficulty;
    }

    update = UpdateTimeoutParameters;
}
