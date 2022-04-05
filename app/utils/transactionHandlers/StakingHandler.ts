import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import {
    AccountTransactionHandler,
    TransactionExportType,
} from '~/utils/transactionTypes';
import { AccountTransaction, TransactionPayload } from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

export default class StakingHandler<
    A extends AccountTransaction<TransactionPayload>
> implements AccountTransactionHandler<A, ConcordiumLedgerClient> {
    constructor(
        public type: string,
        private instanceOf: (
            obj: AccountTransaction<TransactionPayload>
        ) => obj is A
    ) {}

    confirmType(transaction: AccountTransaction<TransactionPayload>) {
        if (this.instanceOf(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    getFileNameForExport(_: A, exportType: TransactionExportType): string {
        return `${this.type
            .toLowerCase()
            .replace(/\s/g, '-')}_${exportType}.json`;
    }

    serializePayload(transaction: A) {
        return serializeTransferPayload(
            transaction.transactionKind,
            transaction.payload
        );
    }

    creationLocationHandler(): string {
        throw new Error('Unimplemented');
    }

    async signTransaction(
        transaction: A,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput
    ) {
        return ledger.signTransfer(transaction, getAccountPath(path));
    }

    view(transaction: A) {
        return AccountTransactionDetails({ transaction });
    }

    createTransaction(): A {
        throw new Error('Unimplemented');
    }

    print = () => undefined;

    title = `Account transaction | ${this.type}`;
}
