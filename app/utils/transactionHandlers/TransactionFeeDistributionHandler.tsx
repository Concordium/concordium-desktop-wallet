import React from 'react';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import TransactionFeeDistributionView from '../../pages/multisig/updates/TransactionFee/TransactionFeeDistributionView';
import UpdateTransactionFeeDistribution, {
    UpdateTransactionFeeDistributionFields,
} from '../../pages/multisig/updates/TransactionFee/UpdateTransactionFeeDistribution';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isTransactionFeeDistribution,
    MultiSignatureTransaction,
    TransactionFeeDistribution,
    UpdateInstruction,
    UpdateType,
} from '../types';
import { serializeTransactionFeeDistribution } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update transaction fee distribution';

type TransactionType = UpdateInstruction<TransactionFeeDistribution>;

export default class TransactionFeeDistributionHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isTransactionFeeDistribution);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { rewardDistribution }: UpdateTransactionFeeDistributionFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        const sequenceNumber =
            nextUpdateSequenceNumbers.transactionFeeDistribution;
        const {
            threshold,
        } = chainParameters.level2Keys.transactionFeeDistribution;

        const transactionFeeDistribution: TransactionFeeDistribution = {
            baker: rewardDistribution.first,
            gasAccount: rewardDistribution.second,
        };

        return createUpdateMultiSignatureTransaction(
            transactionFeeDistribution,
            UpdateType.UpdateTransactionFeeDistribution,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeTransactionFeeDistribution(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signTransactionFeeDistribution(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <TransactionFeeDistributionView
                transactionFeeDistribution={transaction.payload}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.transactionFeeDistribution;
    }

    update = UpdateTransactionFeeDistribution;
}
