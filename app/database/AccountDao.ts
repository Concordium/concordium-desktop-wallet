import { Account } from '../utils/types';
import { knex } from './knex';
import {
    accountsTable,
    identitiesTable,
} from '../constants/databaseNames.json';

function convertBooleans(accounts: Account[]) {
    return accounts.map((account) => {
        return {
            ...account,
            allDecrypted: Boolean(account.allDecrypted),
            isInitial: Boolean(account.isInitial),
        };
    });
}

/**
 * Returns all stored accounts
 *  - Attaches the identityName unto the account object.
 */
export async function getAllAccounts(): Promise<Account[]> {
    const accounts = await (await knex())
        .table(accountsTable)
        .join(
            identitiesTable,
            `${accountsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .select(
            `${accountsTable}.*`,
            `${identitiesTable}.name as identityName`,
            `${identitiesTable}.identityNumber as identityNumber`
        );
    return convertBooleans(accounts);
}

export async function getAccount(
    address: string
): Promise<Account | undefined> {
    const accounts = await (await knex())
        .table(accountsTable)
        .join(
            identitiesTable,
            `${accountsTable}.identityId`,
            '=',
            `${identitiesTable}.id`
        )
        .where({ address })
        .select(
            `${accountsTable}.*`,
            `${identitiesTable}.name as identityName`,
            `${identitiesTable}.identityNumber as identityNumber`
        );

    return convertBooleans(accounts)[0];
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
    const accounts = await (await knex())
        .select()
        .table(accountsTable)
        .where(condition);
    return convertBooleans(accounts);
}

/**
 * Extracts all accounts for a given identity.
 * @param identityId the id of the identity to get the accounts for
 * @returns all accounts attached to the provided identity
 */
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
