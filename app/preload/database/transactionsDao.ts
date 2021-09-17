import {
    Account,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
} from '~/utils/types';
import {
    transactionTable,
    accountsTable,
} from '~/constants/databaseNames.json';
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

/**
 * Extracts the most recent transactions for a given account.
 *
 * To achieve this we search in the database by block time, which
 * is extended until we have reached the number of results we are
 * interested in. If there are not enough results, then less are
 * returned when we conclude there are no more available transactions.
 * @param account the account to get transactions for
 * @param filteredTypes filtering on the transaction kind
 * @param limit maximum number of transactions to return
 * @returns a list of the most recent transactions for the account
 */
async function getTransactionsOfAccount(
    account: Account,
    filteredTypes: TransactionKindString[] = [],
    limit = 100
): Promise<GetTransactionsOutput> {
    const { address } = account;

    const latestTransaction = await (await knex())(transactionTable)
        .where({ id: account.maxTransactionId })
        .first();
    if (!latestTransaction) {
        // When there are no transactions in the database, this will be the case.
        return {
            transactions: [],
            more: false,
        };
    }

    const maxBlockTime = Number(latestTransaction.blockTime);
    let expandHours = 1;
    let fromTime: number;
    let transactions;
    do {
        fromTime = maxBlockTime - 60 * 60 * expandHours;

        const querytransactions = (await knex())<TransferTransaction>(
            transactionTable
        )
            .whereNotIn('transactionKind', filteredTypes)
            .whereBetween('blockTime', [fromTime, maxBlockTime])
            .andWhere((builder) =>
                builder
                    .where({ toAddress: address })
                    .orWhere({ fromAddress: address })
            )
            .orderBy('blockTime', 'desc')
            .limit(limit);

        transactions = await querytransactions;
        expandHours *= 2;
    } while (transactions.length < limit && fromTime > 0);

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

    const hashes = transactions
        .map((t) => t.transactionHash || '')
        .filter((hash) => hash);
    const existingTransactions: TransferTransaction[] = await table
        .whereIn('transactionHash', hashes)
        .select();

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

/**
 * Upserts the provided list of transactions into the database. The maximum
 * id is used to update the corresponding account.
 * @param transactions the array of transactions to upsert, coming from the wallet proxy post conversion
 * @param newMaxId the max of the id's in the array of transactions
 * @returns the newly added transactions, i.e. the array of transactions that were inserted and not updated
 */
export async function upsertTransactionsAndUpdateMaxId(
    transactions: TransferTransaction[],
    address: string,
    newMaxId: bigint
) {
    if (transactions.length === 0) {
        return [];
    }

    const transactionHashes = transactions
        .map((t) => t.transactionHash || '')
        .filter((hash) => hash);
    const transactionTableKnex = (await knex())(transactionTable);

    const existingTransactions: TransferTransaction[] = await transactionTableKnex
        .whereIn('transactionHash', transactionHashes)
        .select();

    const [updates, additions] = partition(transactions, (t) =>
        existingTransactions.some(
            (t_) => t.transactionHash === t_.transactionHash
        )
    );

    const additionChunks = chunkArray(additions, 50);
    await (await knex()).transaction(async (trx) => {
        for (const additionChunk of additionChunks) {
            await trx.table(transactionTable).insert(additionChunk);
        }

        for (const updatedTransaction of updates) {
            await trx
                .table(transactionTable)
                .where({ transactionHash: updatedTransaction.transactionHash })
                .update(updatedTransaction);
        }

        await trx
            .table(accountsTable)
            .where({ address })
            .update({ maxTransactionId: newMaxId.toString() });
    });

    return additions;
}

const exposedMethods: TransactionMethods = {
    getPending: getPendingTransactions,
    hasPending: hasPendingTransactions,
    getTransactionsForAccount: getTransactionsOfAccount,
    hasEncryptedTransactions,
    update: updateTransaction,
    insert: insertTransactions,
    upsertTransactionsAndUpdateMaxId,
};

export default exposedMethods;
