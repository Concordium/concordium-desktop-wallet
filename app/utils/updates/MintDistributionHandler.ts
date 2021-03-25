import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import MintDistributionView from '../../pages/multisig/MintDistributionView';
import UpdateMintDistribution, {
    UpdateMintDistributionFields,
} from '../../pages/multisig/UpdateMintDistribution';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    isMintDistribution,
    MintDistribution,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import { serializeMintDistribution } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<MintDistribution>;

export default class MintDistributionHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isMintDistribution(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        {
            exponent,
            mantissa,
            rewardDistribution,
        }: UpdateMintDistributionFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.mintDistribution
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.authorizations.mintDistribution;

        const mintDistribution: MintDistribution = {
            mintPerSlot: {
                mantissa: parseInt(mantissa, 10),
                exponent: parseInt(exponent, 10),
            },
            bakingReward: rewardDistribution.first,
            finalizationReward: rewardDistribution.second,
        };

        return createUpdateMultiSignatureTransaction(
            mintDistribution,
            UpdateType.UpdateMintDistribution,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeMintDistribution(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signMintDistribution(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return MintDistributionView({ mintDistribution: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.mintDistribution;
    }

    update = UpdateMintDistribution;

    title = 'Foundation Transaction | Update Mint Distribution';
}
