import {
    Account,
    TransferTransaction,
    TransactionStatus,
} from '../utils/types';
import knex from './knex';
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

export async function getTransactionsOfAccount(
    account: Account,
    orderBy = 'id',
    filter: (transaction: TransferTransaction) => boolean = () => true
): Promise<TransferTransaction[]> {
    const { address } = account;
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ toAddress: address })
        .orWhere({ fromAddress: address })
        .orderBy(orderBy);
    return convertBooleans(transactions).filter(filter);
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

    const additionChunks = chunkArray(additions, chunkSize);
    for (let i = 0; i < additionChunks.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await table.insert(additionChunks[i]);
    }

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
    return convertBooleans(transactions);
}
