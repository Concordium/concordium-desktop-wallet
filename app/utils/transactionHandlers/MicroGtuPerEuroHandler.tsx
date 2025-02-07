/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import MicroGtuPerEuroView from '~/pages/multisig/updates/MicroGtuPerEuro/MicroGtuPerEuroView';
import UpdateMicroGtuPerEuro, {
    UpdateMicroGtuPerEuroRateFields,
} from '~/pages/multisig/updates/MicroGtuPerEuro/UpdateMicroGtuPerEuro';
import { getReducedExchangeRate } from '../exchangeRateHelpers';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import {
    Authorizations,
    ChainParameters,
    NextUpdateSequenceNumbers,
} from '../../node/NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    ExchangeRate,
    UpdateInstruction,
    UpdateType,
    MultiSignatureTransaction,
    isExchangeRate,
} from '../types';
import { serializeExchangeRate } from '../UpdateSerialization';
import UpdateHandlerBase from './UpdateHandlerBase';

const TYPE = 'Update micro CCD per euro';

type TransactionType = UpdateInstruction<ExchangeRate>;

export default class MicroGtuPerEuroHandler
    extends UpdateHandlerBase<TransactionType>
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, isExchangeRate);
    }

    async createTransaction(
        chainParameters: ChainParameters,
        nextUpdateSequenceNumbers: NextUpdateSequenceNumbers,
        { microGtuPerEuroRate }: UpdateMicroGtuPerEuroRateFields,
        effectiveTime: bigint,
        expiryTime: bigint
    ): Promise<Omit<MultiSignatureTransaction, 'id'> | undefined> {
        if (!chainParameters || !nextUpdateSequenceNumbers) {
            return undefined;
        }

        const sequenceNumber = nextUpdateSequenceNumbers.microCcdPerEuro;
        const { threshold } = chainParameters.level2Keys.microGTUPerEuro;

        const reduced = getReducedExchangeRate({
            denominator: BigInt(microGtuPerEuroRate.denominator!),
            numerator: BigInt(microGtuPerEuroRate.numerator!),
        });

        return createUpdateMultiSignatureTransaction(
            reduced,
            UpdateType.UpdateMicroGTUPerEuro,
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
        return ledger.signMicroGtuPerEuro(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return <MicroGtuPerEuroView exchangeRate={transaction.payload} />;
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.microGTUPerEuro;
    }

    update = UpdateMicroGtuPerEuro;
}
