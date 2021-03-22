import { AccountPathInput } from '~/features/ledger/Path';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';
import { AccountTransaction } from '../types';

export default class AccountHandlerTypeMiddleware<T extends AccountTransaction>
    implements
        AccountTransactionHandler<AccountTransaction, ConcordiumLedgerClient> {
    base: AccountTransactionHandler<T, ConcordiumLedgerClient>;

    creationLocationHandler: (
        currentLocation: string,
        proposalId: number
    ) => string;

    title: string;

    constructor(base: AccountTransactionHandler<T, ConcordiumLedgerClient>) {
        this.base = base;
        this.title = base.title;
        this.creationLocationHandler = base.creationLocationHandler;
    }

    confirmType(transaction: AccountTransaction) {
        return transaction;
    }

    serializePayload(transaction: AccountTransaction) {
        return this.base.serializePayload(this.base.confirmType(transaction));
    }

    signTransaction(
        transaction: AccountTransaction,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput
    ) {
        return this.base.signTransaction(
            this.base.confirmType(transaction),
            ledger,
            path
        );
    }

    createTransaction(input: Partial<CreateTransactionInput>) {
        return this.base.createTransaction(input);
    }

    view(transaction: AccountTransaction) {
        return this.base.view(this.base.confirmType(transaction));
    }
}
