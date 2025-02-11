import React from 'react';
import { ValidatorScoreParameters, ChainParameters } from '@concordium/web-sdk';

import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import UpdateValidatorScoreParameters, {
    UpdateValidatorScoreParametersFields,
} from '~/pages/multisig/updates/ValidatorScoreParameters/UpdateValidatorScoreParameters';
import ValidatorScoreParametersView from '~/pages/multisig/updates/ValidatorScoreParameters/ValidatorScoreParametersView';

import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
    isMinChainParametersV3,
} from '../types';
import { serializeValidatorScoreParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update validator score parameters';

type TransactionType = UpdateInstruction<ValidatorScoreParameters>;

export default class ValidatorScoreParametersHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(
            TYPE,
            (u): u is TransactionType =>
                ((u as unknown) as TransactionType).type ===
                UpdateType.UpdateValidatorScoreParameters
        );
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { maxMissedRounds }: UpdateValidatorScoreParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        if (!isMinChainParametersV3(chainParameters)) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber =
            nextUpdateSequenceNumbers.validatorScoreParameters;
        const { threshold } = chainParameters.level2Keys.poolParameters;

        const params: ValidatorScoreParameters = {
            maxMissedRounds: BigInt(maxMissedRounds),
        };

        return createUpdateMultiSignatureTransaction(
            params,
            UpdateType.UpdateValidatorScoreParameters,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeValidatorScoreParameters(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signValidatorScoreParameters(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <ValidatorScoreParametersView
                validatorScoreParameters={transaction.payload}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        if (authorizations.version === 0) {
            throw new Error('Connected node used outdated blockSummary format');
        }
        return authorizations.poolParameters;
    }

    update = UpdateValidatorScoreParameters;
}
