import {
    AccountTransaction,
    TransactionPayload,
    instanceOfTransferToEncrypted,
    TransferToEncrypted,
} from '../types';
import TransferHandler from './TransferHandler';
import { AccountTransactionHandler } from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';

type TransactionType = TransferToEncrypted;

const TYPE = 'Shield GTU';

export default class TransferToEncryptedHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfTransferToEncrypted(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    creationLocationHandler(): string {
        throw new Error(
            'Not Supported - This transaction type does not use creationLocationHandler'
        );
    }

    createTransaction(): TransactionType {
        throw new Error(
            'Not Supported - This transaction type does not use createTransaction'
        );
    }

    print = () => undefined;

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
