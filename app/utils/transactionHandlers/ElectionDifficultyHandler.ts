import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import ElectionDifficultyView from '../../pages/multisig/updates/ElectionDifficulty/ElectionDifficultyView';
import UpdateElectionDifficulty, {
    UpdateElectionDifficultyFields,
} from '../../pages/multisig/updates/ElectionDifficulty/UpdateElectionDifficulty';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    ElectionDifficulty,
    isElectionDifficulty,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import { serializeElectionDifficulty } from '../UpdateSerialization';

const TYPE = 'Update Election Difficulty';

type TransactionType = UpdateInstruction<ElectionDifficulty>;

export default class ElectionDifficultyHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isElectionDifficulty(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { electionDifficulty }: UpdateElectionDifficultyFields,
        effectiveTime: bigint
    ): Promise<Partial<MultiSignatureTransaction> | undefined> {
        if (!blockSummary) {
            return undefined;
        }

        const sequenceNumber =
            blockSummary.updates.updateQueues.foundationAccount
                .nextSequenceNumber;
        const {
            threshold,
        } = blockSummary.updates.keys.level2Keys.electionDifficulty;

        return createUpdateMultiSignatureTransaction(
            {
                electionDifficulty: parseInt(electionDifficulty, 10),
            },
            UpdateType.UpdateElectionDifficulty,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeElectionDifficulty(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signElectionDifficulty(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return ElectionDifficultyView(transaction.payload);
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.electionDifficulty;
    }

    update = UpdateElectionDifficulty;

    title = `Foundation Transaction | ${TYPE}`;

    type = TYPE;
}
