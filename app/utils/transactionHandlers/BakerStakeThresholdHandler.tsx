import React from 'react';
import { isUpdateQueuesV0 } from '@concordium/web-sdk';
import type { UpdateQueues } from '@concordium/web-sdk';
import BakerStakeThresholdView from '~/pages/multisig/updates/BakerStakeThreshold/BakerStakeThresholdView';
import UpdateBakerStakeThreshold, {
    UpdateBakerStakeThresholdFields,
} from '~/pages/multisig/updates/BakerStakeThreshold/UpdateBakerStakeThreshold';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, ChainParameters } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    isBakerStakeThreshold,
    BakerStakeThreshold,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeBakerStakeThreshold } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update baker stake threshold';

type TransactionType = UpdateInstruction<BakerStakeThreshold>;

export default class BakerStakeThresholdHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isBakerStakeThreshold);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        updateQueues: UpdateQueues,
        { threshold: bakerStakeThreshold }: UpdateBakerStakeThresholdFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !updateQueues) {
            return undefined;
        }

        if (!isUpdateQueuesV0(updateQueues)) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber =
            updateQueues.bakerStakeThreshold.nextSequenceNumber;
        const { threshold } = chainParameters.level2Keys.poolParameters;

        return createUpdateMultiSignatureTransaction(
            { threshold: BigInt(bakerStakeThreshold) },
            UpdateType.UpdateBakerStakeThreshold,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeBakerStakeThreshold(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signBakerStakeThreshold(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <BakerStakeThresholdView
                bakerStakeThreshold={transaction.payload}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.poolParameters;
    }

    update = UpdateBakerStakeThreshold;
}
