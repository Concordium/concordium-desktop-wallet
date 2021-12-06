import { Knex } from 'knex';
import {
    TimeStampUnit,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
} from '~/utils/types';
import { transactionTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';
import { chunkArray, partition } from '~/utils/basicHelpers';
import { TransactionMethods } from '~/preload/preloadTypes';

async function updateTransaction(
    identifier: Record<string, unknown>,
    updatedValues: Partial<TransferTransaction>
) {
    return (await knex())(transactionTable)
        .where(identifier)
        .update(updatedValues);
}

async function deleteTransaction(transactionHash: string): Promise<number> {
    return (await knex())(transactionTable).where({ transactionHash }).del();
}

async function getPendingTransactions(): Promise<TransferTransaction[]> {
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending })
        .orderBy('id');
    return transactions;
}

async function getFilteredPendingTransactions(
    address: string,
    filteredTypes: TransactionKindString[] = [],
    fromDate?: Date,
    toDate?: Date
): Promise<TransferTransaction[]> {
    const fromTime = (fromDate?.getTime() ?? 0) / TimeStampUnit.seconds;
    const toTime = (toDate?.getTime() ?? Date.now()) / TimeStampUnit.seconds;

    const queryTransactions = (await knex())<TransferTransaction>(
        transactionTable
    )
        .where({ status: TransactionStatus.Pending })
        .whereIn('transactionKind', filteredTypes)
        .andWhere((builder) =>
            builder
                .where({ fromAddress: address })
                .andWhereBetween('blockTime', [fromTime, toTime])
                .orWhere((orBuilder) =>
                    orBuilder
                        .where({ toAddress: address })
                        .andWhereBetween('blockTime', [fromTime, toTime])
                )
        )

        .orderBy('blockTime', 'desc');

    return queryTransactions;
}

async function getTransaction(
    id: string
): Promise<TransferTransaction | undefined> {
    const transaction = await (await knex())<TransferTransaction>(
        transactionTable
    )
        .select()
        .where({ id })
        .first();
    return transaction;
}

async function hasPendingTransactions(fromAddress: string) {
    const transaction = await (await knex())
        .select()
        .table(transactionTable)
        .where({ status: TransactionStatus.Pending, fromAddress })
        .first();
    return Boolean(transaction);
}

async function hasPendingShieldedBalanceTransfer(fromAddress: string) {
    const transaction = await (await knex())
        .select()
        .table(transactionTable)
        .whereIn('transactionKind', [
            TransactionKindString.EncryptedAmountTransfer,
            TransactionKindString.EncryptedAmountTransferWithMemo,
            TransactionKindString.TransferToEncrypted,
            TransactionKindString.TransferToPublic,
        ])
        .where({ status: TransactionStatus.Pending })
        // Do not use the fromAddress index, to ensure that the status
        // index is used as we expect few transactions with the 'pending' status.
        .whereRaw('+fromAddress = ?', fromAddress)
        .first();
    return Boolean(transaction);
}

interface UpdatesAndAdditions {
    hashUpdates: TransferTransaction[];
    idUpdates: TransferTransaction[];
    additions: TransferTransaction[];
}
/**
 * Find which of the given transactions already exists in the database.
 * @returns updates, which are the transactions that already exist,
 * and additions, which are those that don't already exist.
 */
async function findExistingTransactions(
    transactions: TransferTransaction[]
): Promise<UpdatesAndAdditions> {
    const knexConnection = await knex();
    const hashes = transactions
        .map((t) => t.transactionHash || '')
        .filter((hash) => hash);
    let existingTransactions: TransferTransaction[] = await knexConnection
        .table(transactionTable)
        .whereIn('transactionHash', hashes)
        .select();

    const [hashUpdates, additionsOnHash] = partition(transactions, (t) =>
        existingTransactions.some(
            (t_) => t.transactionHash === t_.transactionHash
        )
    );

    if (!additionsOnHash.length) {
        return { hashUpdates, idUpdates: [], additions: [] };
    }

    const ids = additionsOnHash.map((t) => t.id || '').filter((id) => id);
    existingTransactions = await knexConnection
        .table(transactionTable)
        .whereIn('id', ids)
        .select();

    const [idUpdates, additions] = partition(additionsOnHash, (t) =>
        existingTransactions.some((t_) => t.id === t_.id)
    );

    return { hashUpdates, idUpdates, additions };
}

/**
 * Upserts the provided list of transactions into the database as part of a database transaction.
 * @param updates the array of transactions to update
 * @param additions the array of transactions to insert
 * @param trx knex transaction, which these upserts should be added to.
 */
async function upsertTransactionsTransactionally(
    { hashUpdates, idUpdates, additions }: UpdatesAndAdditions,
    trx: Knex.Transaction
): Promise<void> {
    const additionChunks = chunkArray(additions, 50);

    for (const additionChunk of additionChunks) {
        await trx.table(transactionTable).insert(additionChunk);
    }

    for (const updatedTransaction of hashUpdates) {
        const { transactionHash, ...otherFields } = updatedTransaction;
        await trx
            .table(transactionTable)
            .where({ transactionHash })
            .update(otherFields);
    }

    for (const updatedTransaction of idUpdates) {
        const { id, ...otherFields } = updatedTransaction;
        await trx.table(transactionTable).where({ id }).update(otherFields);
    }
}

/** Given a list of transactions, checks which already exists.
 *  New transactions are added to the table, while duplicates are treated
 *  as updates to the current transactions.
 * @Return the list of new transactions.
 * */
export async function insertTransactions(transactions: TransferTransaction[]) {
    const updatesAndAdditions = await findExistingTransactions(transactions);
    await (await knex()).transaction(async (trx) => {
        await upsertTransactionsTransactionally(updatesAndAdditions, trx);
    });
    return updatesAndAdditions.additions;
}

const exposedMethods: TransactionMethods = {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    hasPendingShieldedBalanceTransfer,
    update: updateTransaction,
    insert: insertTransactions,
    getTransaction,
    getFilteredPendingTransactions,
    deleteTransaction,
};

export default exposedMethods;
