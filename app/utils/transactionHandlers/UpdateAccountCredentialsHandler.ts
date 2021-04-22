import AccountTransactionDetails from '../../components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '../../features/ledger/Path';
import { AccountTransactionHandler } from '../transactionTypes';
import {
    UpdateAccountCredentials,
    AccountTransaction,
    TransactionPayload,
    instanceOfUpdateAccountCredentials,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

const TYPE = 'Update Account Credentials';

type TransactionType = UpdateAccountCredentials;

export default class UpdateAccountCredentialsHandler
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfUpdateAccountCredentials(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeTransferPayload(
            transaction.transactionKind,
            transaction.payload
        );
    }

    async signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput
    ) {
        return ledger.signUpdateCredentialTransaction(
            transaction,
            getAccountPath(path)
        );
    }

    view(transaction: TransactionType) {
        return AccountTransactionDetails({ transaction });
    }

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
