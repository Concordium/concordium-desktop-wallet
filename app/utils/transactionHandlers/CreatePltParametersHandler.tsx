import React from 'react';
import { ChainParameters , CreatePLTPayload} from '@concordium/web-sdk';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import UpdateCreatePltParameters, {
    UpdateCreatePltParametersFields,
} from '~/pages/multisig/updates/CreatePLT/CreatePltParameters';
import CreatePltParametersView from '~/pages/multisig/updates/CreatePLT/CreatePltParametersView';

import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
    isMinChainParametersV3,
} from '../types';
import { serializeCreatePltParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';
import { Cbor, TokenId, TokenModuleReference } from '@concordium/web-sdk/plt';

const TYPE = 'Update create PLT parameters';

type TransactionType = UpdateInstruction<CreatePLTPayload>;

export default class CreatePltParametersHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(
            TYPE,
            (u): u is TransactionType =>
                ((u as unknown) as TransactionType).type ===
                UpdateType.UpdateCreatePltParameters
        );
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { decimals }: UpdateCreatePltParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        if (!isMinChainParametersV3(chainParameters)) {
            throw new Error(
                'Connected node uses outdated protocol version. Expect protocol version that supports chain parameters V3.'
            );
        }

        // TODO: node-sdk needs to be updated to expose `next sequence number` for creation of protocol level token
        const sequenceNumber =
            nextUpdateSequenceNumbers.validatorScoreParameters;
        const { threshold } = chainParameters.level2Keys.poolParameters;

        const params: CreatePLTPayload = {
            // TODO fill real values
            tokenId:TokenId.fromString("ETJ"),
            moduleRef:TokenModuleReference.fromHexString("7f64dfb3555d6f24afce8f157e6dce0c0823226f1775a26360b9294e54f7ec9f"),
            // TODO generate the cbor encoding of the initializationParameters
            initializationParameters: Cbor.fromHexString("0x"),

            decimals: Number(decimals)
        };

        return createUpdateMultiSignatureTransaction(
            params,
            UpdateType.UpdateCreatePltParameters,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeCreatePltParameters(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signCreatePltParameters(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return (
            <CreatePltParametersView
                createPltParameters={transaction.payload}
            />
        );
    }

    // TODO: check authorization; we might need the a new version
    getAuthorization(authorizations: Authorizations) {
        if (authorizations.version === 0) {
            throw new Error('Connected node used outdated blockSummary format');
        }
        return authorizations.poolParameters;
    }

    update = UpdateCreatePltParameters;
}
