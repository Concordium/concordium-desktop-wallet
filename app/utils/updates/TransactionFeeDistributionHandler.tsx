import React from 'react';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import TransactionFeeDistributionView from '../../pages/multisig/updates/UpdateTransactionFee/TransactionFeeDistributionView';
import UpdateTransactionFeeDistribution, {
    UpdateTransactionFeeDistributionFields,
} from '../../pages/multisig/updates/UpdateTransactionFee/UpdateTransactionFeeDistribution';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    isTransactionFeeDistribution,
    MultiSignatureTransaction,
    TransactionFeeDistribution,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import { serializeTransactionFeeDistribution } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<TransactionFeeDistribution>;

export default class TransactionFeeDistributionHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isTransactionFeeDistribution(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { rewardDistribution }: UpdateTransactionFeeDistributionFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.transactionFeeDistribution
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.authorizations.transactionFeeDistribution;

        const transactionFeeDistribution: TransactionFeeDistribution = {
            baker: rewardDistribution.first,
            gasAccount: rewardDistribution.second,
        };

        return createUpdateMultiSignatureTransaction(
            transactionFeeDistribution,
            UpdateType.UpdateTransactionFeeDistribution,
            sequenceNumber,
            threshold,
            effectiveTime
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

    title = 'Foundation Transaction | Update Transaction Fee Distribution';
}
