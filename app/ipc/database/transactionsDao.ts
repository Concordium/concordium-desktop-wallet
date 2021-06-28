import { IpcMain } from 'electron';
import {
    Account,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
} from '~/utils/types';
import { transactionTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import { chunkArray, partition } from '~/utils/basicHelpers';
import ipcCommands from '~/constants/ipcCommands.json';
import { GetTransactionsOutput } from '~/database/TransactionDao';

function convertBooleans(transactions: TransferTransaction[]) {
    return transactions.map((transaction) => {
        const remote = Boolean(transaction.remote);
        return {
            ...transaction,
            remote,
        };
    });
}

async function updateTransaction(
    identifier: Record<string, unknown>,
    updatedValues: Partial<TransferTransaction>
) {
    return (await knex())(transactionTable)
        .where(identifier)
        .update(updatedValues);
}

async function getPendingTransactions(): Promise<TransferTransaction[]> {
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending })
        .orderBy('id');
    return convertBooleans(transactions);
}

async function hasPendingTransactions(fromAddress: string) {
    const transaction = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending, fromAddress })
        .first();
    return Boolean(transaction);
}

async function getMaxTransactionsIdOfAccount(
    account: Account
): Promise<number | undefined> {
    const { address } = account;
    const query = await (await knex())
        .table<TransferTransaction>(transactionTable)
        .where({ toAddress: address })
        .orWhere({ fromAddress: address })
        .max<{ maxId: TransferTransaction['id'] }>('id as maxId')
        .first();
    return query?.maxId;
}

async function getTransactionsOfAccount(
    account: Account,
    filteredTypes: TransactionKindString[] = [],
    limit = 100
): Promise<GetTransactionsOutput> {
    const { address } = account;
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .whereNotIn('transactionKind', filteredTypes)
        .andWhere({ toAddress: address })
        .orWhere({ fromAddress: address })
        .orderBy('blockTime', 'desc')
        .orderBy('id', 'desc')
        .limit(limit + 1);
    return {
        transactions: convertBooleans(transactions).slice(0, limit),
        more: transactions.length > limit,
    };
}

export async function insertTransactions(
    transactions: Partial<TransferTransaction>[]
) {
    const table = (await knex())(transactionTable);
    const existingTransactions: TransferTransaction[] = await table.select();
    const [updates, additions] = partition(transactions, (t) =>
        existingTransactions.some(
            (t_) => t.transactionHash === t_.transactionHash
        )
    );

    const additionChunks = chunkArray(additions, 50);
    for (let i = 0; i < additionChunks.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await table.insert(additionChunks[i]);
    }

    await Promise.all(
        updates.map(async (transaction) => {
            const { transactionHash, ...otherFields } = transaction;
            return updateTransaction(
                { transactionHash: transaction.transactionHash },
                otherFields
            );
        })
    );

    return additions;
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.transactions.getPending,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async (_event) => {
            return getPendingTransactions();
        }
    );

    ipcMain.handle(
        ipcCommands.database.transactions.hasPending,
        async (_event, fromAddress: string) => {
            return hasPendingTransactions(fromAddress);
        }
    );

    ipcMain.handle(
        ipcCommands.database.transactions.getMaxTransactionId,
        async (_event, account: Account) => {
            return getMaxTransactionsIdOfAccount(account);
        }
    );

    ipcMain.handle(
        ipcCommands.database.transactions.getTransactionsForAccount,
        async (
            _event,
            account: Account,
            filteredTypes: TransactionKindString[],
            limit: number
        ) => {
            return getTransactionsOfAccount(account, filteredTypes, limit);
        }
    );

    ipcMain.handle(
        ipcCommands.database.transactions.update,
        async (
            _event,
            identifier: Record<string, unknown>,
            updatedValues: Partial<TransferTransaction>
        ) => {
            return updateTransaction(identifier, updatedValues);
        }
    );

    ipcMain.handle(
        ipcCommands.database.transactions.insert,
        async (_event, transactions: Partial<TransferTransaction>[]) => {
            return insertTransactions(transactions);
        }
    );
}
