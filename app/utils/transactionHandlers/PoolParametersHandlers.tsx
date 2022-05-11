import React from 'react';
import { isBlockSummaryV0 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import PoolParametersView from '~/pages/multisig/updates/PoolParameters/PoolParametersView';
import UpdatePoolParameters from '~/pages/multisig/updates/PoolParameters/UpdatePoolParameters';
import { UpdatePoolParametersFields } from '~/pages/multisig/updates/PoolParameters/util';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
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
        blockSummary: BlockSummary,
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
        if (!blockSummary) {
            return undefined;
        }

        if (isBlockSummaryV0(blockSummary)) {
            throw new Error('Update incompatible with chain protocol version');
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.poolParameters.nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.poolParameters;

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
