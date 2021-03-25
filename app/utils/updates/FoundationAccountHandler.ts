import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernanceLevel2Path } from '../../features/ledger/Path';
import FoundationAccountView from '../../pages/multisig/FoundationAccountView';
import UpdateFoundationAccount, {
    UpdateFoundationAccountFields,
} from '../../pages/multisig/UpdateFoundationAccount';
import { createUpdateMultiSignatureTransaction } from '../MultiSignatureTransactionHelper';
import { Authorizations, BlockSummary } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    FoundationAccount,
    isFoundationAccount,
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
} from '../types';
import { serializeFoundationAccount } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<FoundationAccount>;

export default class FoundationAccountHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isFoundationAccount(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    async createTransaction(
        blockSummary: BlockSummary,
        { foundationAccount }: UpdateFoundationAccountFields,
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
        } = blockSummary.updates.authorizations.foundationAccount;

        return createUpdateMultiSignatureTransaction(
            { address: foundationAccount },
            UpdateType.UpdateFoundationAccount,
            sequenceNumber,
            threshold,
            effectiveTime
        );
    }

    serializePayload(transaction: TransactionType) {
        return serializeFoundationAccount(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernanceLevel2Path();
        return ledger.signFoundationAccount(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return FoundationAccountView({
            foundationAccount: transaction.payload,
        });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.foundationAccount;
    }

    update = UpdateFoundationAccount;

    title = 'Foundation Transaction | Update Foundation Account';
}
