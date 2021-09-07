import {
    Account,
    TimeStampUnit,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
} from '~/utils/types';
import { transactionTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import { chunkArray, partition } from '~/utils/basicHelpers';
import { GetTransactionsOutput } from '~/database/types';
import { TransactionMethods } from '~/preload/preloadTypes';

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
    return transactions;
}

async function hasPendingTransactions(fromAddress: string) {
    const transaction = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending, fromAddress })
        .first();
    return Boolean(transaction);
}

async function getTransactionsOfAccount(
    account: Account,
    filteredTypes: TransactionKindString[] = [],
    fromDate?: Date,
    toDate?: Date,
    limit = 100
): Promise<GetTransactionsOutput> {
    const { address } = account;
    const from = (fromDate?.getTime() ?? 0) / TimeStampUnit.seconds;
    const to = (toDate?.getTime() ?? Date.now()) / TimeStampUnit.seconds;

    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .whereIn('transactionKind', filteredTypes)
        .andWhere((builder) => {
            builder.where({ toAddress: address }).orWhere({
                fromAddress: address,
            });
        })
        .andWhereBetween('blockTime', [from.toString(), to.toString()])
        .orderBy('blockTime', 'desc')
        .orderBy('id', 'desc')
        .limit(limit + 1);

    return {
        transactions: transactions.slice(0, limit),
        more: transactions.length > limit,
    };
}

async function hasEncryptedTransactions(
    address: string,
    fromTime: string,
    toTime: string
): Promise<boolean> {
    const transaction = await (await knex())
        .select()
        .table(transactionTable)
        .where({
            transactionKind: TransactionKindString.EncryptedAmountTransfer,
        })
        .whereBetween('blockTime', [fromTime, toTime])
        .whereNull('decryptedAmount')
        .where((builder) => {
            builder.where({ toAddress: address }).orWhere({
                fromAddress: address,
            });
        })
        .first();
    return Boolean(transaction);
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

const exposedMethods: TransactionMethods = {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    getTransactionsForAccount: getTransactionsOfAccount,
    hasEncryptedTransactions,
    update: updateTransaction,
    insert: insertTransactions,
};

export default exposedMethods;
