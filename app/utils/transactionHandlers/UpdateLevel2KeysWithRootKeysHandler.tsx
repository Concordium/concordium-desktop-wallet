import React from 'react';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceRootPath } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { BlockSummary } from '../../node/NodeApiTypes';
import {
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
    isUpdateLevel2KeysWithRootKeys,
    AuthorizationKeysUpdate,
    getAuthorizationKeysUpdateVersion,
} from '../types';
import { serializeAuthorizationKeysUpdate } from '../UpdateSerialization';
import { UpdateInstructionHandler } from '../transactionTypes';
import AuthorizationKeysView from '~/pages/multisig/updates/UpdateGovernanceKeys/AuthorizationKeysView';
import UpdateLevel2KeysWithRootKeys from '~/pages/multisig/updates/UpdateGovernanceKeys/UpdateLevel2KeysWithRootKeys';
import { removeRemovedKeys } from '~/pages/multisig/updates/UpdateGovernanceKeys/util';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update level 2 governance keys using root keys';

type TransactionType = UpdateInstruction<AuthorizationKeysUpdate>;

export default class UpdateLevel2KeysUsingRootKeysHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isUpdateLevel2KeysWithRootKeys);
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
        const { threshold } = blockSummary.updates.keys.rootKeys;

        return createUpdateMultiSignatureTransaction(
            authorizationKeysUpdate,
            UpdateType.UpdateLevel2KeysUsingRootKeys,
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
        const path: number[] = getGovernanceRootPath();
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
            0x2a,
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

    update = UpdateLevel2KeysWithRootKeys;
}
