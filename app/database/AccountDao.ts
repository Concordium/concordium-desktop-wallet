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
    address: string,
    updatedValues: Partial<Account>
) {
    return (await knex())(accountsTable)
        .where({ address })
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

export async function removeAccount(accountAddress: string) {
    return (await knex())(accountsTable)
        .where({ address: accountAddress })
        .del();
}

export async function updateSignatureThreshold(
    address: string,
    signatureThreshold: number
) {
    return (await knex())(accountsTable)
        .where({ address })
        .update({ signatureThreshold });
}

export async function confirmInitialAccount(
    identityId: number,
    updatedValues: Partial<Account>
) {
    return (await knex())
        .select()
        .table(accountsTable)
        .where({ identityId, isInitial: 1 })
        .first()
        .update(updatedValues);
}
