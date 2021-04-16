import { AccountPathInput } from '~/features/ledger/Path';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountTransactionHandler } from '~/utils/transactionTypes';
import { AccountTransaction } from '~/utils/types';

export default class AccountHandlerTypeMiddleware<T>
    implements
        AccountTransactionHandler<AccountTransaction, ConcordiumLedgerClient> {
    base: AccountTransactionHandler<T, ConcordiumLedgerClient>;

    title: string;

    type: string;

    constructor(base: AccountTransactionHandler<T, ConcordiumLedgerClient>) {
        this.base = base;
        this.title = base.title;
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

    view(transaction: AccountTransaction) {
        return this.base.view(this.base.confirmType(transaction));
    }
}
