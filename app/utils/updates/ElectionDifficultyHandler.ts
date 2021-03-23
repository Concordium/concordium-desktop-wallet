import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import ElectionDifficultyView from '../../pages/multisig/ElectionDifficultyView';
import UpdateElectionDifficulty from '../../pages/multisig/UpdateElectionDifficulty';
import { Authorizations } from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    ElectionDifficulty,
    isElectionDifficulty,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeElectionDifficulty } from '../UpdateSerialization';

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

    title = 'Foundation Transaction | Update Election Difficulty';
}
