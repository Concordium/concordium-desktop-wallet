import BakerStakeThresholdView from '~/pages/multisig/BakerStakeThresholdView';
import UpdateBakerStakeThreshold, {
    UpdateBakerStakeThresholdFields,
} from '~/pages/multisig/UpdateBakerStakeThreshold';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    isBakerStakeThreshold,
    BakerStakeThreshold,
    MultiSignatureTransaction,
    UpdateType,
} from '../types';
import { serializeBakerStakeThreshold } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<BakerStakeThreshold>;

export default class EuroPerEnergyHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isBakerStakeThreshold(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { threshold: bakerStakeThreshold }: UpdateBakerStakeThresholdFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.bakerStakeThreshold
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.authorizations.bakerStakeThreshold;

        return createUpdateMultiSignatureTransaction(
            { threshold: BigInt(bakerStakeThreshold) },
            UpdateType.UpdateBakerStakeThreshold,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeBakerStakeThreshold(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signBakerStakeThreshold(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return BakerStakeThresholdView({
            bakerStakeThreshold: transaction.payload,
        });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.bakerStakeThreshold;
    }

    update = UpdateBakerStakeThreshold;

    title = 'Foundation Transaction | Update baker stake threshold';
}
