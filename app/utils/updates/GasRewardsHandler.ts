import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import GasRewardsView from '../../pages/multisig/GasRewardsView';
import UpdateGasRewards, {
    UpdateGasRewardsFields,
} from '../../pages/multisig/UpdateGasRewards/UpdateGasRewards';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    GasRewards,
    isGasRewards,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import { serializeGasRewards } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<GasRewards>;

export default class GasRewardsHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isGasRewards(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    createTransaction(
        blockSummary: BlockSummary,
        gasRewards: UpdateGasRewardsFields,
        effectiveTime: bigint
    ): Partial<MultiSignatureTransaction> | undefined {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.gasRewards.nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.authorizations.paramGASRewards;

        return createUpdateMultiSignatureTransaction(
            gasRewards,
            UpdateType.UpdateGASRewards,
            sequenceNumber,
            threshold,
            effectiveTime
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
        return GasRewardsView({ gasRewards: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.paramGASRewards;
    }

    update = UpdateGasRewards;

    title = 'Foundation Transaction | Update Gas Rewards';
}
