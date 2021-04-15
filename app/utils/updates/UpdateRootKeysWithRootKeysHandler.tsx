import React from 'react';
import HigherLevelKeysView from '~/pages/multisig/updates/UpdateHigherLevelKeys/HigherLevelKeysView';
import UpdateTransactionFeeDistribution from '~/pages/multisig/updates/UpdateTransactionFee/UpdateTransactionFeeDistribution';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceRootPath } from '../../features/ledger/Path';
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
    KeyUpdateEntryStatus,
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
        higherLevelKeyUpdate: HigherLevelKeyUpdate,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.rootKeys.nextSequenceNumber;
        const { threshold } = blockSummary.updates.keys.rootKeys;

        return createUpdateMultiSignatureTransaction(
            higherLevelKeyUpdate,
            UpdateType.UpdateRootKeysWithRootKeys,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        // The transaction submitted to the chain has to contain the exact set
        // of keys to be the new key set. Our transaction holds a bit more information,
        // so that we can display a 'diff' of what keys have changed, and that is
        // removed here to serialize the transaction correctly.
        const keysWithoutRemoved = transaction.payload.updateKeys.filter(
            (key) => key.status !== KeyUpdateEntryStatus.Removed
        );
        const payloadWithoutRemovedKeys = {
            ...transaction.payload,
            updateKeys: keysWithoutRemoved,
        };

        return serializeHigherLevelKeyUpdate(payloadWithoutRemovedKeys);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceRootPath();

        // TODO Fix duplicated code here...
        const keysWithoutRemoved = transaction.payload.updateKeys.filter(
            (key) => key.status !== KeyUpdateEntryStatus.Removed
        );
        const payloadWithoutRemovedKeys = {
            ...transaction.payload,
            updateKeys: keysWithoutRemoved,
        };

        const transactionWithoutRemoved: TransactionType = {
            ...transaction,
            payload: payloadWithoutRemovedKeys,
        };

        return ledger.signHigherLevelKeysUpdate(
            transactionWithoutRemoved,
            this.serializePayload(transactionWithoutRemoved),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <HigherLevelKeysView
                higherLevelKeyUpdate={transaction.payload}
                type={transaction.type}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.bakerStakeThreshold;
    }

    // TODO This should perhaps not be set? Or do we set it to the create key update proposal, and load it throug that?
    update = UpdateTransactionFeeDistribution;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
