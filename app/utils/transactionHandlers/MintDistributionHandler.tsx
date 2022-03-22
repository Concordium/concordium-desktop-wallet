import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import MintDistributionView from '~/pages/multisig/updates/MintDistribution/MintDistributionView';
import UpdateMintDistribution, {
    UpdateMintDistributionFields,
} from '~/pages/multisig/updates/MintDistribution/UpdateMintDistribution';
import { parseMintRate } from '../mintDistributionHelpers';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isMintDistribution,
    MintDistribution,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateType,
} from '../types';
import { serializeMintDistribution } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update mint distribution';

type TransactionType = UpdateInstruction<MintDistribution>;

export default class MintDistributionHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isMintDistribution);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { mintPerSlot, rewardDistribution }: UpdateMintDistributionFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.mintDistribution
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.mintDistribution;

        let mintDistribution: MintDistribution;
        let updateType: UpdateType;
        if (mintPerSlot) {
            // version 0
            updateType = UpdateType.UpdateMintDistribution;
            const parsedMintPerSlot = parseMintRate(mintPerSlot);

            if (!parsedMintPerSlot) {
                return undefined;
            }
            mintDistribution = {
                version: 0,
                mintPerSlot: parsedMintPerSlot,
                bakingReward: rewardDistribution.first,
                finalizationReward: rewardDistribution.second,
            };
        } else {
            updateType = UpdateType.UpdateMintDistributionV1;
            mintDistribution = {
                version: 1,
                bakingReward: rewardDistribution.first,
                finalizationReward: rewardDistribution.second,
            };
        }

        return createUpdateMultiSignatureTransaction(
            mintDistribution,
            updateType,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
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
            transaction.payload.version,
            path
        );
    }

    view(transaction: TransactionType) {
        return <MintDistributionView mintDistribution={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.mintDistribution;
    }

    update = UpdateMintDistribution;
}
