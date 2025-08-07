import React from 'react';
import { ChainParameters } from '@concordium/web-sdk';
import { AccountAddress } from '@concordium/web-sdk/types';
import { TokenHolder, TokenId, TokenInitializationParameters, CreatePLTPayload, TokenModuleReference, createPltPayload, TokenMetadataUrl, TokenAmount } from '@concordium/web-sdk/plt';

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

        const sequenceNumber =
            nextUpdateSequenceNumbers.protocolLevelTokens;
        const { threshold } = chainParameters.level2Keys.poolParameters;

        // TODO fill real values
        const tokenMetadataUrl: TokenMetadataUrl.Type = TokenMetadataUrl.fromString("https://")
        // TODO fill real values
        const holderAccount: TokenHolder.Type = TokenHolder.fromAccountAddress(AccountAddress.fromBase58("4FmiTW2L2AccyR9VjzsnpWFSAcohXWf7Vf797i36y526mqiEcp"))
        // TODO fill real values
        const tokenInitializationParameters: TokenInitializationParameters = {
            name: "blabla", initialSupply: TokenAmount.fromDecimal(5n, Number(decimals)), metadata: tokenMetadataUrl, governanceAccount: holderAccount, mintable: false, burnable: false, allowList: false, denyList: false
        }
        const params: CreatePLTPayload =
            createPltPayload({
                // TODO fill real values
                tokenId: TokenId.fromString("ETJ"),
                moduleRef: TokenModuleReference.fromHexString("5c5c2645db84a7026d78f2501740f60a8ccb8fae5c166dc2428077fd9a699a4a"),
                decimals
            }, tokenInitializationParameters)

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
