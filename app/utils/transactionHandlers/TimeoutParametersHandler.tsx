import React from 'react';
import {
    isChainParametersV0,
    isChainParametersV1,
    NextUpdateSequenceNumbers,
} from '@concordium/web-sdk';
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

        if (
            isChainParametersV0(chainParameters) ||
            isChainParametersV1(chainParameters)
        ) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber = nextUpdateSequenceNumbers.timeoutParameters;
        const { threshold } = chainParameters.level2Keys.electionDifficulty;

        const payload = {
            timeoutBase: fields.timeoutBase,
            timeoutIncrease: {
                numerator: BigInt(fields.timeoutIncrease.numerator),
                denominator: BigInt(fields.timeoutIncrease.denominator),
            },
            timeoutDecrease: {
                numerator: BigInt(fields.timeoutDecrease.numerator),
                denominator: BigInt(fields.timeoutDecrease.denominator),
            },
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
