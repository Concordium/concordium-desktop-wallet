import AccountTransactionDetails from '../../components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import { AccountTransactionHandler } from '../transactionTypes';
import {
    UpdateAccountCredentials,
    AccountTransaction,
    TransactionPayload,
    instanceOfUpdateAccountCredentials,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

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

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signUpdateCredentialTransaction(transaction, path);
    }

    view(transaction: TransactionType) {
        return AccountTransactionDetails({ transaction });
    }

    title = 'Account Transaction | Update Account Credentials';
}
