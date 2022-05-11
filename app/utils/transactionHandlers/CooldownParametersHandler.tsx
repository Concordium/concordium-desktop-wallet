import React from 'react';
import {
    isBlockSummaryV0,
    isAuthorizationsV1,
} from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import CooldownParametersView from '~/pages/multisig/updates/CooldownParameters/CooldownParametersView';
import UpdateCooldownParameters, {
    UpdateCooldownParametersFields,
} from '~/pages/multisig/updates/CooldownParameters/UpdateCooldownParameters';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    CooldownParameters,
    UpdateInstruction,
    UpdateType,
    MultiSignatureTransaction,
    isCooldownParameters,
} from '../types';
import { serializeCooldownParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update cooldown parameters';

type TransactionType = UpdateInstruction<CooldownParameters>;

export default class CooldownParametersHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isCooldownParameters);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        {
            delegatorCooldown,
            poolOwnerCooldown,
        }: UpdateCooldownParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        if (isBlockSummaryV0(blockSummary)) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.cooldownParameters
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.cooldownParameters;

        const cooldownParameters: CooldownParameters = {
            delegatorCooldown,
            poolOwnerCooldown,
        };

        return createUpdateMultiSignatureTransaction(
            cooldownParameters,
            UpdateType.CooldownParameters,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeCooldownParameters(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signCooldownParameters(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <CooldownParametersView cooldownParameters={transaction.payload} />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        if (!isAuthorizationsV1(authorizations)) {
            throw new Error('Connected node used outdated blockSummary format');
        }
        return authorizations.cooldownParameters;
    }

    update = UpdateCooldownParameters;
}
