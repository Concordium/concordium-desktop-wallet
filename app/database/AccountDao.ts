import { Account } from '../utils/types';
import knex from './knex';
import {
    accountsTable,
    identitiesTable,
} from '../constants/databaseNames.json';

/**
 * Returns all stored accounts
 *  - Attaches the identityName unto the account object.
 */
export async function getAllAccounts(): Promise<Account[]> {
    return (await knex())
        .table(accountsTable)
        .join(
            identitiesTable,
            `${accountsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .select(
            `${accountsTable}.*`,
            `${identitiesTable}.name as identityName`
        );
}

export async function insertAccount(account: Account | Account[]) {
    return (await knex())(accountsTable).insert(account);
}

export async function updateAccount(
    accountName: string,
    updatedValues: Record<string, unknown>
) {
    return (await knex())(accountsTable)
        .where({ name: accountName })
        .update(updatedValues);
}

export async function findAccounts(condition: Record<string, unknown>) {
    return (await knex()).select().table(accountsTable).where(condition);
}

export async function getAccountsOfIdentity(
    identityId: number
): Promise<Account[]> {
    return findAccounts({ identityId });
}
