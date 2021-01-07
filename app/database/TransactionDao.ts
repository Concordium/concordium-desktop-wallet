import { Account, Transaction } from '../utils/types';
import knex from './knex';
import { transactionTable } from '../constants/databaseNames.json';
import { up, down } from './migrations/20201230111229_create_transaction_table';

export async function getTransactionsOfAccount(
    account: Account
): Promise<Transaction[]> {
    const { address } = account;
    return (await knex())
        .select()
        .table(transactionTable)
        .where({ toAddress: address })
        .orWhere({ fromAddress: address });
}

export async function insertTransactions(transactions: Transaction[]) {
    const table = (await knex())(transactionTable);
    return table.insert(transactions);
    // TODO: merge remote transactions with local ones, or replace.
}

export async function resetTransactions() {
    // TODO: used for testing, eventually should be removed
    const knexInstance = await knex();
    await down(knexInstance);
    await up(knexInstance);
}
