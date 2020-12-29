import { Account } from '../utils/types';
import knex from './knex';
import { accountsTable } from '../constants/databaseNames.json';

export async function getAllAccounts(): Promise<Account[]> {
    return (await knex()).select().table(accountsTable);
}

export async function insertAccount(account: Account) {
    return (await knex())(accountsTable).insert(account);
}

export async function updateAccount(accountName: string, updatedValues) {
    return (await knex())(accountsTable)
        .where({ name: accountName })
        .update(updatedValues);
}
