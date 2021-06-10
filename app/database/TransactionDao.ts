import {
    Account,
    TransferTransaction,
    TransactionKindString,
} from '../utils/types';

export function convertBooleans(transactions: TransferTransaction[]) {
    return transactions.map((transaction) => {
        const remote = Boolean(transaction.remote);
        const success =
            transaction.success === null
                ? transaction.success
                : Boolean(transaction.success);
        return {
            ...transaction,
            remote,
            success,
        };
    });
}

interface GetTransactionsOutput {
    transactions: TransferTransaction[];
    more: boolean;
}

export async function getTransactionsOfAccount(
    account: Account,
    filteredTypes: TransactionKindString[] = [],
    limit = 100
): Promise<GetTransactionsOutput> {
    return window.ipcRenderer.invoke(
        'dbGetTransactionsOfAccount',
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
        'dbUpdateTransaction',
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
    return window.ipcRenderer.invoke('dbInsertTransactions', transactions);
}

export async function getMaxTransactionsIdOfAccount(
    account: Account
): Promise<number | undefined> {
    return window.ipcRenderer.invoke('dbGetMaxTransactionId', account);
}

export async function getPendingTransactions(): Promise<TransferTransaction[]> {
    return window.ipcRenderer.invoke('dbGetPendingTransactions');
}
