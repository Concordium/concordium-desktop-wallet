import {
    Account,
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
} from '../utils/types';
import { knex } from './knex';
import { transactionTable } from '../constants/databaseNames.json';
import { partition, chunkArray } from '../utils/basicHelpers';

const chunkSize = 50;

function convertBooleans(transactions: TransferTransaction[]) {
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

export async function updateTransaction(
    identifier: Record<string, unknown>,
    updatedValues: Partial<TransferTransaction>
) {
    return (await knex())(transactionTable)
        .where(identifier)
        .update(updatedValues);
}

/** Given a list of transactions, checks which already exists.
 *  New transactions are added to the table, while duplicates are treated
 *  as updates to the current transactions.
 * @Return the list of new transactions.
 * */
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

    const additionChunks = chunkArray(additions, chunkSize);
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

export async function hasPendingTransactions(
    fromAddress: string
): Promise<boolean> {
    const transaction = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending, fromAddress })
        .first();
    return Boolean(transaction);
}

export async function getPendingTransactions(
    orderBy = 'id'
): Promise<TransferTransaction[]> {
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending })
        .orderBy(orderBy);
    return convertBooleans(transactions);
}
