import { AccountPathInput } from '~/features/ledger/Path';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    CreateTransactionInput,
    AccountTransactionHandler,
} from '~/utils/transactionTypes';
import { AccountTransaction } from '~/utils/types';

export default class AccountHandlerTypeMiddleware<T extends AccountTransaction>
    implements
        AccountTransactionHandler<AccountTransaction, ConcordiumLedgerClient> {
    base: AccountTransactionHandler<T, ConcordiumLedgerClient>;

    creationLocationHandler: (currentLocation: string) => string;

    title: string;

    type: string;

    constructor(base: AccountTransactionHandler<T, ConcordiumLedgerClient>) {
        this.base = base;
        this.title = base.title;
        this.creationLocationHandler = base.creationLocationHandler;
        this.type = base.type;
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
