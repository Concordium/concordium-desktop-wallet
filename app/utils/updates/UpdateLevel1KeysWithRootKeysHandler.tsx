import React from 'react';
import HigherLevelKeysView from '~/pages/multisig/updates/UpdateHigherLevelKeys/HigherLevelKeysView';
import UpdateLevel1KeysWithRootKeys from '~/pages/multisig/updates/UpdateHigherLevelKeys/UpdateLevel1KeysWithRootKeys';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceRootPath } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorization, Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransaction,
    UpdateType,
    HigherLevelKeyUpdate,
    isUpdateLevel1KeysWithRootKeys,
} from '../types';
import { serializeHigherLevelKeyUpdate } from '../UpdateSerialization';
import { removeRemovedKeys } from './HigherLevelKeysHelpers';

const TYPE = 'Update Level 1 Governance Keys';

type TransactionType = UpdateInstruction<HigherLevelKeyUpdate>;

export default class UpdateLevel1KeysWithRootKeysHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isUpdateLevel1KeysWithRootKeys(transaction)) {
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
            blockSummary.updates.updateQueues.level1Keys.nextSequenceNumber;
        const { threshold } = blockSummary.updates.keys.level1Keys;

        return createUpdateMultiSignatureTransaction(
            higherLevelKeyUpdate,
            UpdateType.UpdateLevel1KeysWithRootKeys,
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAuthorization(_authorizations: Authorizations): Authorization {
        throw new Error(
            'If this method was invoked, then it happened due to an implementation error.'
        );
    }

    update = UpdateLevel1KeysWithRootKeys;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
