import React from 'react';
import {
    isBlockSummaryV0,
    isAuthorizationsV1,
} from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import TimeParametersView from '~/pages/multisig/updates/TimeParameters/TimeParametersView';
import UpdateTimeParameters, {
    UpdateTimeParametersFields,
} from '~/pages/multisig/updates/TimeParameters/UpdateTimeParameters';
import { parseMintRate } from '../mintDistributionHelpers';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    TimeParameters,
    UpdateInstruction,
    UpdateType,
    MultiSignatureTransaction,
    isTimeParameters,
} from '../types';
import { serializeTimeParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update time parameters';

type TransactionType = UpdateInstruction<TimeParameters>;

export default class TimeParametersHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isTimeParameters);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { mintPerPayday, rewardPeriodLength }: UpdateTimeParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        const parsedMintRate = parseMintRate(mintPerPayday);
        if (!blockSummary || !parsedMintRate) {
            return undefined;
        }

        if (isBlockSummaryV0(blockSummary)) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.timeParameters.nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.timeParameters;

        const timeParameters: TimeParameters = {
            mintRatePerPayday: parsedMintRate,
            rewardPeriodLength,
        };

        return createUpdateMultiSignatureTransaction(
            timeParameters,
            UpdateType.TimeParameters,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeTimeParameters(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signTimeParameters(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <TimeParametersView timeParameters={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        if (!isAuthorizationsV1(authorizations)) {
            throw new Error('Connected node used outdated blockSummary format');
        }
        return authorizations.timeParameters;
    }

    update = UpdateTimeParameters;
}
