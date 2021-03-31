import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import EuroPerEnergyView from '../../pages/multisig/EuroPerEnergyView';
import UpdateEuroPerEnergy, {
    UpdateEuroPerEnergyFields,
} from '../../pages/multisig/UpdateEuroPerEnergy';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    isExchangeRate,
    ExchangeRate,
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeExchangeRate } from '../UpdateSerialization';

const TYPE = 'Update Euro Per Energy';

type TransactionType = UpdateInstruction<ExchangeRate>;

export default class EuroPerEnergyHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
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
        { euroPerEnergy }: UpdateEuroPerEnergyFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.euroPerEnergy.nextSequenceNumber;
        const { threshold } = blockSummary.updates.authorizations.euroPerEnergy;

        return createUpdateMultiSignatureTransaction(
            euroPerEnergy,
            UpdateType.UpdateEuroPerEnergy,
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
        return ledger.signEuroPerEnergy(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return EuroPerEnergyView({ exchangeRate: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.euroPerEnergy;
    }

    update = UpdateEuroPerEnergy;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
