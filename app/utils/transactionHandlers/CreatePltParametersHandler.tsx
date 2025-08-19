import React from 'react';
import { ChainParameters } from '@concordium/web-sdk';
import { AccountAddress, Authorizations } from '@concordium/web-sdk/types';
import {
    TokenHolder,
    TokenId,
    TokenInitializationParameters,
    TokenModuleReference,
    TokenMetadataUrl,
    TokenAmount,
} from '@concordium/web-sdk/plt';

import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import UpdateCreatePltParameters, {
    UpdateCreatePltParametersFields,
} from '~/pages/multisig/updates/CreatePLT/CreatePltParameters';
import CreatePltParametersView from '~/pages/multisig/updates/CreatePLT/CreatePltParametersView';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { hexStringToUint8Array } from '~/utils/numberStringHelpers';
import { NextUpdateSequenceNumbers } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
    isMinChainParametersV3,
    CreatePLTPayload,
} from '../types';
import { serializeCreatePltParameters } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

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
        {
            tokenId,
            name,
            moduleRef,
            metadataUrl,
            metadataHash,
            governanceAccount,
            decimals,
            initialSupply,
            allowList,
            denyList,
            mintable,
            burnable,
        }: UpdateCreatePltParametersFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        const sequenceNumber = nextUpdateSequenceNumbers.protocolLevelTokens;

        if (!isMinChainParametersV3(chainParameters)) {
            throw new Error(
                'Connected node uses outdated protocol version. Expect protocol version that supports chain parameters V3.'
            );
        }
        if (!chainParameters.level2Keys?.createPlt) {
            throw new Error(
                '`createPlt` field is missing in `chainParameters.level2Keys`. This indicates that the connected node is not on protocol version 9 or above.'
            );
        }
        const { threshold } = chainParameters.level2Keys.createPlt;

        const tokenMetadataUrl = metadataHash
            ? TokenMetadataUrl.create(
                  metadataUrl,
                  hexStringToUint8Array(metadataHash)
              )
            : TokenMetadataUrl.fromString(metadataUrl);
        const initSupply = initialSupply
            ? TokenAmount.create(initialSupply, decimals)
            : undefined;

        const holderAccount: TokenHolder.Type = TokenHolder.fromAccountAddress(
            AccountAddress.fromBase58(governanceAccount)
        );
        const tokenInitializationParameters: TokenInitializationParameters = {
            name,
            metadata: tokenMetadataUrl,
            governanceAccount: holderAccount,
            ...(initSupply !== undefined && { initialSupply: initSupply }),
            ...(allowList !== undefined && { allowList }),
            ...(denyList !== undefined && { denyList }),
            ...(mintable !== undefined && { mintable }),
            ...(burnable !== undefined && { burnable }),
        };
        const params: CreatePLTPayload = {
            tokenId: TokenId.fromString(tokenId),
            moduleRef: TokenModuleReference.fromHexString(moduleRef),
            decimals,
            initializationParameters: tokenInitializationParameters,
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
        return serializeCreatePltParameters(transaction.payload).serialization;
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

    getAuthorization(authorizations: Authorizations) {
        if (authorizations.version === 0) {
            throw new Error(
                '`authorizations` is of version 0. PLT creation needs a connected node that is on protocol version 9 or above. Protocol version 9 should already use `authorizations` version 1'
            );
        }

        if (!authorizations.createPlt) {
            throw new Error(
                '`createPlt` field is missing in `authorizations`. This indicates that the connected node is not on protocol version 9 or above.'
            );
        }

        return authorizations.createPlt;
    }

    update = UpdateCreatePltParameters;
}
