import React from 'react';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel1Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { BlockSummary } from '../../node/NodeApiTypes';
import {
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
    AuthorizationKeysUpdate,
    getAuthorizationKeysUpdateVersion,
    isUpdateLevel2KeysWithLevel1Keys,
} from '../types';
import { serializeAuthorizationKeysUpdate } from '../UpdateSerialization';
import { UpdateInstructionHandler } from '../transactionTypes';
import AuthorizationKeysView from '~/pages/multisig/updates/UpdateGovernanceKeys/AuthorizationKeysView';
import { removeRemovedKeys } from '~/pages/multisig/updates/UpdateGovernanceKeys/util';
import UpdateLevel2KeysWithLevel1Keys from '~/pages/multisig/updates/UpdateGovernanceKeys/UpdateLevel2KeysWithLevel1Keys';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update level 2 governance keys using level 1 keys';

type TransactionType = UpdateInstruction<AuthorizationKeysUpdate>;

export default class UpdateLevel2KeysUsingLevel1KeysHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isUpdateLevel2KeysWithLevel1Keys);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        authorizationKeysUpdate: AuthorizationKeysUpdate,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
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
            0x2b,
            getAuthorizationKeysUpdateVersion(transaction.payload.keyUpdateType)
        );
    }

    view(transaction: TransactionType) {
        return (
            <AuthorizationKeysView
                authorizationKeysUpdate={transaction.payload}
            />
        );
    }

    update = UpdateLevel2KeysWithLevel1Keys;
}
