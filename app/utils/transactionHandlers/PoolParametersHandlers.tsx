import React from 'react';
import { isUpdateQueuesV0 } from '@concordium/common-sdk/lib/blockSummaryHelpers';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import PoolParametersView from '~/pages/multisig/updates/PoolParameters/PoolParametersView';
import UpdatePoolParameters from '~/pages/multisig/updates/PoolParameters/UpdatePoolParameters';
import { UpdatePoolParametersFields } from '~/pages/multisig/updates/PoolParameters/util';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    UpdateQueues,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    PoolParameters,
    UpdateInstruction,
    UpdateType,
    MultiSignatureTransaction,
    isPoolParameters,
} from '../types';
import { serializePoolParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';
import { getReducedFraction } from '../exchangeRateHelpers';

const TYPE = 'Update pool parameters';

type TransactionType = UpdateInstruction<PoolParameters>;

export default class PoolParametersHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isPoolParameters);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        updateQueues: UpdateQueues,
        {
            passiveFinalizationCommission,
            passiveBakingCommission,
            passiveTransactionCommission,
            finalizationCommissionRange,
            bakingCommissionRange,
            transactionCommissionRange,
            minimumEquityCapital,
            capitalBound,
            leverageBound,
        }: UpdatePoolParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !updateQueues) {
            return undefined;
        }

        if (isUpdateQueuesV0(updateQueues)) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber = updateQueues.poolParameters.nextSequenceNumber;
        const { threshold } = chainParameters.level2Keys.poolParameters;

        const reducedLeverageBound = getReducedFraction({
            denominator: BigInt(leverageBound.denominator),
            numerator: BigInt(leverageBound.numerator),
        });

        const poolParameters: PoolParameters = {
            passiveCommissions: {
                transactionFeeCommission: passiveTransactionCommission,
                bakingRewardCommission: passiveBakingCommission,
                finalizationRewardCommission: passiveFinalizationCommission,
            },
            commissionBounds: {
                transactionFeeCommission: transactionCommissionRange,
                bakingRewardCommission: bakingCommissionRange,
                finalizationRewardCommission: finalizationCommissionRange,
            },
            minimumEquityCapital,
            capitalBound,
            leverageBound: reducedLeverageBound,
        };

        return createUpdateMultiSignatureTransaction(
            poolParameters,
            UpdateType.PoolParameters,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializePoolParameters(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signPoolParameters(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <PoolParametersView poolParameters={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.poolParameters;
    }

    update = UpdatePoolParameters;
}
