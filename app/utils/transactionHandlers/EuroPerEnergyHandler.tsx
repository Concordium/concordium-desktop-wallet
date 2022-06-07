import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import EuroPerEnergyView from '~/pages/multisig/updates/EuroPerEnergy/EuroPerEnergyView';
import UpdateEuroPerEnergy, {
    UpdateEuroPerEnergyFields,
} from '~/pages/multisig/updates/EuroPerEnergy/UpdateEuroPerEnergy';
import { getReducedExchangeRate } from '../exchangeRateHelpers';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isExchangeRate,
    ExchangeRate,
    UpdateInstruction,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeExchangeRate } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update euro per energy';

type TransactionType = UpdateInstruction<ExchangeRate>;

export default class EuroPerEnergyHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isExchangeRate);
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { euroPerEnergyRate }: UpdateEuroPerEnergyFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.euroPerEnergy.nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.euroPerEnergy;

        const reduced = getReducedExchangeRate({
            denominator: BigInt(euroPerEnergyRate.denominator),
            numerator: BigInt(euroPerEnergyRate.numerator),
        });

        return createUpdateMultiSignatureTransaction(
            reduced,
            UpdateType.UpdateEuroPerEnergy,
            sequenceNumber,
            threshold,
            effectiveTime,
            expiryTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeExchangeRate(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signEuroPerEnergy(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <EuroPerEnergyView exchangeRate={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.euroPerEnergy;
    }

    update = UpdateEuroPerEnergy;
}
