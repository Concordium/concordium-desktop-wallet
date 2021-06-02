import React from 'react';
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
    AuthorizationKeysUpdate,
    isUpdateLevel2KeysWithLevel1Keys,
} from '../types';
import { serializeAuthorizationKeysUpdate } from '../UpdateSerialization';
import { UpdateInstructionHandler } from '../transactionTypes';
import AuthorizationKeysView from '~/pages/multisig/updates/UpdateGovernanceKeys/AuthorizationKeysView';
import { removeRemovedKeys } from '~/pages/multisig/updates/UpdateGovernanceKeys/util';
import UpdateLevel2KeysWithLevel1Keys from '~/pages/multisig/updates/UpdateGovernanceKeys/UpdateLevel2KeysWithLevel1Keys';

const TYPE = 'Update Level 2 Governance Keys using level 1 keys';

type TransactionType = UpdateInstruction<AuthorizationKeysUpdate>;

export default class UpdateLevel2KeysUsingLevel1KeysHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isUpdateLevel2KeysWithLevel1Keys(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        authorizationKeysUpdate: AuthorizationKeysUpdate,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.level2Keys.nextSequenceNumber;
        const { threshold } = blockSummary.updates.keys.level1Keys;

        return createUpdateMultiSignatureTransaction(
            authorizationKeysUpdate,
            UpdateType.UpdateLevel2KeysUsingLevel1Keys,
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
        return serializeAuthorizationKeysUpdate(payloadWithoutRemovedKeys);
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

        return ledger.signAuthorizationKeysUpdate(
            transactionWithoutRemoved,
            this.serializePayload(transaction),
            path,
            0x2b
        );
    }

    view(transaction: TransactionType) {
        return (
            <AuthorizationKeysView
                authorizationKeysUpdate={transaction.payload}
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

    update = UpdateLevel2KeysWithLevel1Keys;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
