import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import GasRewardsView from '~/pages/multisig/updates/GasRewards/GasRewardsView';
import UpdateGasRewards, {
    UpdateGasRewardsFields,
} from '~/pages/multisig/updates/GasRewards/UpdateGasRewards';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    GasRewards,
    isGasRewards,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateType,
} from '../types';
import { serializeGasRewards } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update GAS rewards';

type TransactionType = UpdateInstruction<GasRewards>;

export default class GasRewardsHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isGasRewards);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        gasRewardsFields: UpdateGasRewardsFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        const sequenceNumber = nextUpdateSequenceNumbers.gasRewards;
        const { threshold } = chainParameters.level2Keys.paramGASRewards;

        let gasRewards: GasRewards;
        let updateType: UpdateType;
        if ('finalizationProof' in gasRewardsFields) {
            // version 0
            updateType = UpdateType.UpdateGASRewards;
            gasRewards = {
                version: 0,
                ...gasRewardsFields,
            };
        } else {
            updateType = UpdateType.UpdateGASRewardsV1;
            gasRewards = {
                version: 1,
                ...gasRewardsFields,
            };
        }

        return createUpdateMultiSignatureTransaction(
            gasRewards,
            updateType,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeGasRewards(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signGasRewards(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <GasRewardsView gasRewards={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.paramGASRewards;
    }

    update = UpdateGasRewards;
}
