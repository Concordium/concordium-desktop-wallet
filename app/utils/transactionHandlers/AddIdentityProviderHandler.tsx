import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import AddIdentityProviderView from '~/pages/multisig/updates/AddIdentityProvider/AddIdentityProviderView';
import CreateAddIdentityProvider, {
    AddIdentityProviderFields,
} from '~/pages/multisig/updates/AddIdentityProvider/CreateAddIdentityProvider';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
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
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
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
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        const ipDescription = {
            name,
            url,
            description,
        };

        const sequenceNumber = nextUpdateSequenceNumbers.addIdentityProvider;
        const { threshold } = chainParameters.level2Keys.addIdentityProvider;

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
