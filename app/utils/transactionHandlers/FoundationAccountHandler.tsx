import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import FoundationAccountView from '~/pages/multisig/updates/FoundationAccount/FoundationAccountView';
import UpdateFoundationAccount, {
    UpdateFoundationAccountFields,
} from '~/pages/multisig/updates/FoundationAccount/UpdateFoundationAccount';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    FoundationAccount,
    isFoundationAccount,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateType,
} from '../types';
import { serializeFoundationAccount } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update foundation account';

type TransactionType = UpdateInstruction<FoundationAccount>;

export default class FoundationAccountHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isFoundationAccount);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { foundationAccount }: UpdateFoundationAccountFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.foundationAccount
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.foundationAccount;

        return createUpdateMultiSignatureTransaction(
            { address: foundationAccount },
            UpdateType.UpdateFoundationAccount,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeFoundationAccount(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signFoundationAccount(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <FoundationAccountView foundationAccount={transaction.payload} />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.foundationAccount;
    }

    update = UpdateFoundationAccount;
}
