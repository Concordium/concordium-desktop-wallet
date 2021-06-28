import {
    Account,
    TransferTransaction,
    TransactionKindString,
} from '../utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

export interface GetTransactionsOutput {
    transactions: TransferTransaction[];
    more: boolean;
}

export async function getTransactionsOfAccount(
    account: Account,
    filteredTypes: TransactionKindString[] = [],
    limit = 100
): Promise<GetTransactionsOutput> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.transactions.getTransactionsForAccount,
        account,
        filteredTypes,
        limit
    );
}

export async function updateTransaction(
    identifier: Record<string, unknown>,
    updatedValues: Partial<TransferTransaction>
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.transactions.update,
        identifier,
        updatedValues
    );
}

/** Given a list of transactions, checks which already exists.
 *  New transactions are added to the table, while duplicates are treated
 *  as updates to the current transactions.
 * @Return the list of new transactions.
 * */
export async function insertTransactions(
    transactions: Partial<TransferTransaction>[]
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.transactions.insert,
        transactions
    );
}

export async function hasPendingTransactions(
    fromAddress: string
): Promise<boolean> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.transactions.hasPending,
        fromAddress
    );
}

export async function getPendingTransactions(): Promise<TransferTransaction[]> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.transactions.getPending
    );
}
