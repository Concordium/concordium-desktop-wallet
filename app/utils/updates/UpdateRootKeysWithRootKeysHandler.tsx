import React from 'react';
import HigherLevelKeysView from '~/pages/multisig/updates/UpdateHigherLevelKeys/HigherLevelKeysView';
import UpdateHigherLevelKeys from '~/pages/multisig/updates/UpdateHigherLevelKeys/UpdateHigherLevelKeys';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransaction,
    UpdateType,
    HigherLevelKeyUpdate,
    isUpdateRootKeysWithRootKeys,
} from '../types';
import { serializeHigherLevelKeyUpdate } from '../UpdateSerialization';

const TYPE = 'Update root keys with root keys';

type TransactionType = UpdateInstruction<HigherLevelKeyUpdate>;

export default class UpdateRootKeysWithRootKeysHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isUpdateRootKeysWithRootKeys(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        // TODO Fix sequence number and threshold after updating local blockchain
        // to see what the correct format is now.
        const sequenceNumber =
            blockSummary.updates.updateQueues.bakerStakeThreshold
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.authorizations.bakerStakeThreshold;

        // TODO Fix this
        return createUpdateMultiSignatureTransaction(
            { electionDifficulty: 15 },
            UpdateType.UpdateBakerStakeThreshold,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeHigherLevelKeyUpdate(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signHigherLevelKeysUpdate(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <HigherLevelKeysView higherLevelKeyUpdate={transaction.payload} />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.bakerStakeThreshold;
    }

    update = UpdateHigherLevelKeys;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
