import AccountTransactionDetails from '../../components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '../../features/ledger/Path';
import { AccountTransactionHandler } from '../transactionTypes';
import {
    UpdateAccountCredentials,
    AccountTransaction,
    TransactionPayload,
    instanceOfUpdateAccountCredentials,
    TransactionKindId,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';
import routes from '~/constants/routes.json';

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

    creationLocationHandler(currentLocation: string) {
        const getNewLocation = () => {
            switch (currentLocation) {
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
                default:
                    throw new Error('unknown location');
            }
        };
        return getNewLocation().replace(
            ':transactionKind',
            `${TransactionKindId.Update_credentials}`
        );
    }

    createTransaction() {
        return Promise.reject(
            new Error(
                'Unsupported function: UpdateAccountCredentials transactions should be created explicitly and not through handler.'
            )
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

    print = () => undefined;

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
