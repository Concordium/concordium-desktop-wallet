import { AccountPathInput } from '~/features/ledger/Path';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    CreateTransactionInput,
    AccountTransactionHandler,
    TransactionExportType,
} from '~/utils/transactionTypes';
import {
    MultiSignatureTransactionStatus,
    AccountTransaction,
    instanceOfAccountTransaction,
    Transaction,
    TransactionPayload,
} from '~/utils/types';
import { throwLoggedError } from '../basicHelpers';

export default class AccountHandlerTypeMiddleware<T extends AccountTransaction>
    implements
        AccountTransactionHandler<
            AccountTransaction,
            ConcordiumLedgerClient,
            Transaction
        > {
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

    confirmType(transaction: Transaction) {
        if (instanceOfAccountTransaction(transaction)) {
            return transaction;
        }
        return throwLoggedError('Invalid transaction type was given as input.');
    }

    getFileNameForExport(
        transaction: AccountTransaction<TransactionPayload>,
        exportType: TransactionExportType
    ): string {
        return this.base.getFileNameForExport(
            this.base.confirmType(transaction),
            exportType
        );
    }

    serializePayload(transaction: AccountTransaction) {
        return this.base.serializePayload(this.base.confirmType(transaction));
    }

    signTransaction(
        transaction: AccountTransaction,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput,
        displayMessage?: (message: string | JSX.Element) => void
    ) {
        return this.base.signTransaction(
            this.base.confirmType(transaction),
            ledger,
            path,
            displayMessage
        );
    }

    createTransaction(input: Partial<CreateTransactionInput>) {
        return this.base.createTransaction(input);
    }

    view(transaction: AccountTransaction) {
        return this.base.view(this.base.confirmType(transaction));
    }

    print(
        transaction: Transaction,
        status: MultiSignatureTransactionStatus,
        identiconImage?: string
    ) {
        return this.base.print(
            this.confirmType(transaction),
            status,
            identiconImage
        );
    }
}
