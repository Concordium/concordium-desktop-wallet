import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import AddIdentityProviderView from '~/pages/multisig/updates/AddIdentityProvider/AddIdentityProviderView';
import CreateAddIdentityProvider, {
    AddIdentityProviderFields,
} from '~/pages/multisig/updates/AddIdentityProvider/CreateAddIdentityProvider';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isAddIdentityProvider,
    AddIdentityProvider,
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeAddIdentityProvider } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Add identity provider';

type TransactionType = UpdateInstruction<AddIdentityProvider>;

export default class AddIdentityProviderHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isAddIdentityProvider);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        {
            name,
            url,
            description,
            ipIdentity,
            ipVerifyKey,
            ipCdiVerifyKey,
        }: AddIdentityProviderFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const ipDescription = {
            name,
            url,
            description,
        };

        const sequenceNumber =
            blockSummary.updates.updateQueues.addIdentityProvider
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.addIdentityProvider;

        const payload = {
            ipDescription,
            ipIdentity,
            ipVerifyKey,
            ipCdiVerifyKey,
        };

        return createUpdateMultiSignatureTransaction(
            payload,
            UpdateType.AddIdentityProvider,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeAddIdentityProvider(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signAddIdentityProvider(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <AddIdentityProviderView
                addIdentityProvider={transaction.payload}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.addIdentityProvider;
    }

    update = CreateAddIdentityProvider;
}
