import React from 'react';
import { isAuthorizationsV1, isChainParametersV0 } from '@concordium/web-sdk';

import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import TimeParametersView from '~/pages/multisig/updates/TimeParameters/TimeParametersView';
import UpdateTimeParameters, {
    UpdateTimeParametersFields,
} from '~/pages/multisig/updates/TimeParameters/UpdateTimeParameters';
import { parseMintRate } from '../mintDistributionHelpers';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
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
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { mintPerPayday, rewardPeriodLength }: UpdateTimeParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        const parsedMintRate = parseMintRate(mintPerPayday);
        if (!chainParameters || !nextUpdateSequenceNumbers || !parsedMintRate) {
            return undefined;
        }

        if (isChainParametersV0(chainParameters)) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber = nextUpdateSequenceNumbers.timeParameters;
        const { threshold } = chainParameters.level2Keys.timeParameters;

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
