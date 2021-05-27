import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import MintDistributionView from '~/pages/multisig/updates/MintDistribution/MintDistributionView';
import UpdateMintDistribution, {
    UpdateMintDistributionFields,
} from '~/pages/multisig/updates/MintDistribution/UpdateMintDistribution';
import { parseMintPerSlot } from '../mintDistributionHelpers';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isMintDistribution,
    MintDistribution,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import { serializeMintDistribution } from '../UpdateSerialization';

const TYPE = 'Update Mint Distribution';

type TransactionType = UpdateInstruction<MintDistribution>;

export default class MintDistributionHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isMintDistribution(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { mintPerSlot, rewardDistribution }: UpdateMintDistributionFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        const parsedMintPerSlot = parseMintPerSlot(mintPerSlot);
        if (!blockSummary || !parsedMintPerSlot) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.mintDistribution
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.mintDistribution;

        const mintDistribution: MintDistribution = {
            mintPerSlot: parsedMintPerSlot,
            bakingReward: rewardDistribution.first,
            finalizationReward: rewardDistribution.second,
        };

        return createUpdateMultiSignatureTransaction(
            mintDistribution,
            UpdateType.UpdateMintDistribution,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeMintDistribution(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signMintDistribution(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <MintDistributionView mintDistribution={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.mintDistribution;
    }

    print = () => undefined;

    update = UpdateMintDistribution;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
