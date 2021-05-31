import React from 'react';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceRootPath } from '../../features/ledger/Path';
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
    isUpdateLevel2KeysWithRootKeys,
    AuthorizationKeysUpdate,
} from '../types';
import { serializeAuthorizationKeysUpdate } from '../UpdateSerialization';
import { UpdateInstructionHandler } from '../transactionTypes';
import UpdateLevel2KeysWithRootKeys from '~/pages/multisig/updates/UpdateAuthorizationKeys/UpdateLevel2KeysWithRootKeys';
import AuthorizationKeysView from '~/pages/multisig/updates/UpdateAuthorizationKeys/AuthorizationKeysView';

const TYPE = 'Update Level 2 Governance Keys using root keys';

type TransactionType = UpdateInstruction<AuthorizationKeysUpdate>;

export default class UpdateLevel1KeysUsingRootKeysHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isUpdateLevel2KeysWithRootKeys(transaction)) {
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
        const { threshold } = blockSummary.updates.keys.rootKeys;

        return createUpdateMultiSignatureTransaction(
            // TODO We probably need to send something that differentiates using root vs. level1.
            authorizationKeysUpdate,
            UpdateType.UpdateLevel2KeysUsingRootKeys,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        // TODO We have to remove the 'removed' keys.
        // const payloadWithoutRemovedKeys = removeRemovedKeys(
        //     transaction.payload
        // );
        return serializeAuthorizationKeysUpdate(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceRootPath();
        // const payloadWithoutRemovedKeys = removeRemovedKeys(
        //     transaction.payload
        // );
        // const transactionWithoutRemoved: TransactionType = {
        //     ...transaction,
        //     payload: payloadWithoutRemovedKeys,
        // };
        // TODO Remove 'removed' when that is implemented here.

        return ledger.signAuthorizationKeysUpdate(
            transaction,
            this.serializePayload(transaction),
            path,
            0x2a
        );
    }

    view(transaction: TransactionType) {
        return (
            <AuthorizationKeysView
                authorizationKeysUpdate={transaction.payload}
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

    update = UpdateLevel2KeysWithRootKeys;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
