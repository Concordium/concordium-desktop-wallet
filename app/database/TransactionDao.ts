import { Account, Transaction } from '../utils/types';
import knex from './knex';
import { transactionTable } from '../constants/databaseNames.json';

export async function getTransactionsOfAccount(
    account: Account,
    filter: (transction: Transaction) => boolean = undefined,
    orderBy = 'id'
): Promise<Transaction[]> {
    const { address } = account;
    const transactions = await (await knex())
        .select()
        .table(transactionTable)
        .where({ toAddress: address })
        .orWhere({ fromAddress: address })
        .orderBy(orderBy);
    if (filter) {
        return transactions.filter(filter);
    }
    return transactions;
}

export async function insertTransactions(transactions: Transaction[]) {
    const table = (await knex())(transactionTable);
    return table.insert(transactions);
    // TODO: merge remote transactions with local ones, or replace.
}

export async function updateTransaction(id, updatedValues) {
    return (await knex())(transactionTable).where({ id }).update(updatedValues);
}

export async function resetTransactions() {
    // TODO: used for testing, eventually should be removed
    return (await knex())(transactionTable).del();
}

export async function getMaxTransactionsIdOfAccount(account) {
    const { address } = account;
    const query = await (await knex())
        .table(transactionTable)
        .where({ toAddress: address })
        .orWhere({ fromAddress: address })
        .max('id as maxId')
        .first();
    return query.maxId;
}
