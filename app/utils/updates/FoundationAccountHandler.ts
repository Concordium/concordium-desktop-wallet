import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import FoundationAccountView from '../../pages/multisig/FoundationAccountView';
import UpdateFoundationAccount from '../../pages/multisig/UpdateFoundationAccount';
import { TransactionHandler } from '../transactionTypes';
import {
    FoundationAccount,
    isFoundationAccount,
    UpdateInstruction,
    UpdateInstructionPayload,
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

    serializePayload(transaction: TransactionType) {
        return serializeFoundationAccount(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
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

    update = UpdateFoundationAccount;
}
