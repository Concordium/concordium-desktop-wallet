/* eslint-disable @typescript-eslint/no-unused-vars */
import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import {
    AccountTransaction,
    TransactionPayload,
    MultiSignatureTransactionStatus,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';

export default abstract class TransferHandler<
    TransactionType extends AccountTransaction
> implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor(
        public type: string,
        private instanceOf: (
            obj: AccountTransaction<TransactionPayload>
        ) => obj is TransactionType
    ) {}

    confirmType(transaction: AccountTransaction<TransactionPayload>) {
        if (this.instanceOf(transaction)) {
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
        return ledger.signTransfer(transaction, getAccountPath(path));
    }

    view(transaction: TransactionType) {
        return AccountTransactionDetails({ transaction });
    }

    creationLocationHandler(_location: string): string {
        throw new Error(
            'Not Supported - This transaction type does not use creationLocationHandler'
        );
    }

    createTransaction(
        _input: Partial<CreateTransactionInput>
    ): TransactionType {
        throw new Error(
            'Not Supported - This transaction type does not use createTransaction'
        );
    }

    print(
        _transaction: AccountTransaction,
        _status: MultiSignatureTransactionStatus,
        _identiconImage?: string
    ): JSX.Element | undefined {
        return undefined;
    }

    title = `Account Transaction | ${this.type}`;
}
