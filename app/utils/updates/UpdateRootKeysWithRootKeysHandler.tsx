import React from 'react';
import HigherLevelKeysView from '~/pages/multisig/updates/UpdateHigherLevelKeys/HigherLevelKeysView';
import UpdateRootKeys from '~/pages/multisig/updates/UpdateHigherLevelKeys/UpdateRootKeys';
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
} from '../types';
import { serializeHigherLevelKeyUpdate } from '../UpdateSerialization';
import { removeRemovedKeys } from './HigherLevelKeysHelpers';

const TYPE = 'Update Root Governance Keys';

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
        const payloadWithoutRemovedKeys = removeRemovedKeys(
            transaction.payload
        );
        return serializeHigherLevelKeyUpdate(payloadWithoutRemovedKeys);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceRootPath();
        const payloadWithoutRemovedKeys = removeRemovedKeys(
            transaction.payload
        );
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
        // TODO This should throw an error if called, as it is not required by this type.
        return authorizations.bakerStakeThreshold;
    }

    update = UpdateRootKeys;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
