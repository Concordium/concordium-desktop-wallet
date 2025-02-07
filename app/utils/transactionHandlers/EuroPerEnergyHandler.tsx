/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import EuroPerEnergyView from '~/pages/multisig/updates/EuroPerEnergy/EuroPerEnergyView';
import UpdateEuroPerEnergy, {
    UpdateEuroPerEnergyFields,
} from '~/pages/multisig/updates/EuroPerEnergy/UpdateEuroPerEnergy';
import { getReducedExchangeRate } from '../exchangeRateHelpers';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
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
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { euroPerEnergyRate }: UpdateEuroPerEnergyFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        const sequenceNumber = nextUpdateSequenceNumbers.euroPerEnergy;
        const { threshold } = chainParameters.level2Keys.euroPerEnergy;

        const reduced = getReducedExchangeRate({
            denominator: BigInt(euroPerEnergyRate.denominator!),
            numerator: BigInt(euroPerEnergyRate.numerator!),
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
