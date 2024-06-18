import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import AddAnonymityRevokerView from '~/pages/multisig/updates/AddAnonymityRevoker/AddAnonymityRevokerView';
import CreateAddAnonymityRevoker, {
    AddAnonymityRevokerFields,
} from '~/pages/multisig/updates/AddAnonymityRevoker/CreateAddAnonymityRevoker';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    AddAnonymityRevoker,
    isAddAnonymityRevoker,
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeAddAnonymityRevoker } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Add identity disclosure authority';

type TransactionType = UpdateInstruction<AddAnonymityRevoker>;

export default class AddAnonymityRevokerHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isAddAnonymityRevoker);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        {
            name,
            url,
            description,
            arIdentity,
            arPublicKey,
        }: AddAnonymityRevokerFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        const arDescription = {
            name,
            url,
            description,
        };

        const sequenceNumber = nextUpdateSequenceNumbers.addAnonymityRevoker;
        const { threshold } = chainParameters.level2Keys.addAnonymityRevoker;

        const payload = {
            arIdentity,
            arDescription,
            arPublicKey,
        };

        return createUpdateMultiSignatureTransaction(
            payload,
            UpdateType.AddAnonymityRevoker,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeAddAnonymityRevoker(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signAddAnonymityRevoker(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <AddAnonymityRevokerView
                addAnonymityRevoker={transaction.payload}
            />
        );
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.addAnonymityRevoker;
    }

    update = CreateAddAnonymityRevoker;
}
