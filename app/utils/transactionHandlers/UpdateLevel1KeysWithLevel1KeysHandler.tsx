import React from 'react';
import HigherLevelKeysView from '~/pages/multisig/updates/UpdateGovernanceKeys/HigherLevelKeysView';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel1Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorization,
    Authorizations,
    BlockSummary,
} from '../../node/NodeApiTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransaction,
    UpdateType,
    HigherLevelKeyUpdate,
    isUpdateLevel1KeysWithLevel1Keys,
} from '../types';
import { serializeHigherLevelKeyUpdate } from '../UpdateSerialization';
import { removeRemovedKeys } from '../updates/HigherLevelKeysHelpers';
import { UpdateInstructionHandler } from '../transactionTypes';
import UpdateLevel1KeysWithLevel1Keys from '~/pages/multisig/updates/UpdateGovernanceKeys/UpdateLevel1KeysWithLevel1Keys';

const TYPE = 'Update Level 1 Governance Keys using level 1 keys';

type TransactionType = UpdateInstruction<HigherLevelKeyUpdate>;

export default class UpdateLevel1KeysWithLevel1KeysHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isUpdateLevel1KeysWithLevel1Keys(transaction)) {
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
            blockSummary.updates.updateQueues.level1Keys.nextSequenceNumber;
        const { threshold } = blockSummary.updates.keys.level1Keys;

        return createUpdateMultiSignatureTransaction(
            { ...higherLevelKeyUpdate, keyUpdateType: 0 },
            UpdateType.UpdateLevel1KeysUsingLevel1Keys,
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
        const path: number[] = getGovernanceLevel1Path();
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
            0x29
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

    update = UpdateLevel1KeysWithLevel1Keys;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
