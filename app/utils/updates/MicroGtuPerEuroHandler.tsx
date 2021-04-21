import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '~/features/ledger/Path';
import MicroGtuPerEuroView from '~/pages/multisig/updates/MicroGtuPerEuro/MicroGtuPerEuroView';
import UpdateMicroGtuPerEuro, {
    UpdateMicroGtuPerEuroRateFields,
} from '~/pages/multisig/updates/MicroGtuPerEuro/UpdateMicroGtuPerEuro';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    ExchangeRate,
    UpdateInstruction,
    isExchangeRate,
    UpdateInstructionPayload,
    UpdateType,
    MultiSignatureTransaction,
} from '../types';
import { serializeExchangeRate } from '../UpdateSerialization';

const TYPE = 'Update Micro GTU Per Euro';

type TransactionType = UpdateInstruction<ExchangeRate>;

export default class MicroGtuPerEuroHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isExchangeRate(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { microGtuPerEuroRate }: UpdateMicroGtuPerEuroRateFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.microGTUPerEuro
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.microGTUPerEuro;

        return createUpdateMultiSignatureTransaction(
            {
                denominator: BigInt(microGtuPerEuroRate.denominator),
                numerator: BigInt(microGtuPerEuroRate.numerator),
            },
            UpdateType.UpdateMicroGTUPerEuro,
            sequenceNumber,
            threshold,
            effectiveTime
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

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
