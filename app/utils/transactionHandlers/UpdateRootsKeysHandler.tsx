import React from 'react';
import HigherLevelKeysView from '~/pages/multisig/updates/UpdateGovernanceKeys/HigherLevelKeysView';
import UpdateRootKeys from '~/pages/multisig/updates/UpdateGovernanceKeys/UpdateRootKeys';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceRootPath } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { ChainParameters, UpdateQueues } from '../../node/NodeApiTypes';
import {
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
    HigherLevelKeyUpdate,
    isUpdateRootKeys,
} from '../types';
import { serializeHigherLevelKeyUpdate } from '../UpdateSerialization';
import { removeRemovedKeys } from '../updates/HigherLevelKeysHelpers';
import { UpdateInstructionHandler } from '../transactionTypes';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update root governance keys';

type TransactionType = UpdateInstruction<HigherLevelKeyUpdate>;

export default class UpdateRootKeysHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isUpdateRootKeys);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        updateQueues: UpdateQueues,
        higherLevelKeyUpdate: HigherLevelKeyUpdate,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !updateQueues) {
            return undefined;
        }

        const sequenceNumber = updateQueues.rootKeys.nextSequenceNumber;
        const { threshold } = chainParameters.rootKeys;

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

    update = UpdateRootKeys;
}
