import React from 'react';
import { ChainParameters } from '@concordium/web-sdk';
import { AccountAddress } from '@concordium/web-sdk/types';
import {
    TokenHolder,
    TokenId,
    TokenInitializationParameters,
    CreatePLTPayload,
    TokenModuleReference,
    createPltPayload,
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

        if (!isMinChainParametersV3(chainParameters)) {
            throw new Error(
                'Connected node uses outdated protocol version. Expect protocol version that supports chain parameters V3.'
            );
        }

        const sequenceNumber = nextUpdateSequenceNumbers.protocolLevelTokens;
        const { threshold } = chainParameters.level2Keys.poolParameters;

        const tokenMetadataUrl = metadataHash
            ? TokenMetadataUrl.create(
                  metadataUrl,
                  hexStringToUint8Array(metadataHash)
              )
            : TokenMetadataUrl.fromString(metadataUrl);

        const holderAccount: TokenHolder.Type = TokenHolder.fromAccountAddress(
            AccountAddress.fromBase58(governanceAccount)
        );
        const tokenInitializationParameters: TokenInitializationParameters = {
            name,
            initialSupply: TokenAmount.fromDecimal(
                initialSupply,
                Number(decimals)
            ),
            metadata: tokenMetadataUrl,
            governanceAccount: holderAccount,
            mintable,
            burnable,
            allowList,
            denyList,
        };
        const params: CreatePLTPayload = createPltPayload(
            {
                tokenId: TokenId.fromString(tokenId),
                moduleRef: TokenModuleReference.fromHexString(moduleRef),
                decimals,
            },
            tokenInitializationParameters
        );

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
