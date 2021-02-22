import {
    Account,
    TransferTransaction,
    TransactionStatus,
} from '../utils/types';
import knex from './knex';
import { transactionTable } from '../constants/databaseNames.json';
import { partition } from '../utils/basicHelpers';

export async function getTransactionsOfAccount(
    account: Account,
    filter: (transaction: TransferTransaction) => boolean = () => true,
    orderBy = 'id'
): Promise<TransferTransaction[]> {
    const { address } = account;
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ toAddress: address })
        .orWhere({ fromAddress: address })
        .orderBy(orderBy);
    return transactions.filter(filter);
}

export async function updateTransaction(
    identifier: Record<string, unknown>,
    updatedValues: Partial<TransferTransaction>
) {
    return (await knex())(transactionTable)
        .where(identifier)
        .update(updatedValues);
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

    await Promise.all(
        additions.map(async (transaction) => {
            await table.insert(transaction);
        })
    );

    return Promise.all(
        updates.map(async (transaction) => {
            const { transactionHash, ...otherFields } = transaction;
            return updateTransaction(
                { transactionHash: transaction.transactionHash },
                otherFields
            );
        })
    );
}

export async function getMaxTransactionsIdOfAccount(
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

export async function getPendingTransactions(
    orderBy = 'id'
): Promise<TransferTransaction[]> {
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending })
        .orderBy(orderBy);
    return transactions;
}
