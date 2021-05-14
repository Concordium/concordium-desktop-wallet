import React from 'react';
import HigherLevelKeysView from '~/pages/multisig/updates/UpdateHigherLevelKeys/HigherLevelKeysView';
import UpdateRootKeys from '~/pages/multisig/updates/UpdateHigherLevelKeys/UpdateRootKeys';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceRootPath } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorization, Authorizations, BlockSummary } from '../NodeApiTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransaction,
    UpdateType,
    HigherLevelKeyUpdate,
    isUpdateRootKeys,
} from '../types';
import { serializeHigherLevelKeyUpdate } from '../UpdateSerialization';
import { removeRemovedKeys } from '../updates/HigherLevelKeysHelpers';
import { UpdateInstructionHandler } from '../transactionTypes';

const TYPE = 'Update Root Governance Keys';

type TransactionType = UpdateInstruction<HigherLevelKeyUpdate>;

export default class UpdateRootKeysHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isUpdateRootKeys(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        higherLevelKeyUpdate: HigherLevelKeyUpdate,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.rootKeys.nextSequenceNumber;
        const { threshold } = blockSummary.updates.keys.rootKeys;

        return createUpdateMultiSignatureTransaction(
            { ...higherLevelKeyUpdate, keyUpdateType: 0 },
            UpdateType.UpdateRootKeys,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
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
            path,
            0x28
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

    print = () => undefined;

    update = UpdateRootKeys;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
