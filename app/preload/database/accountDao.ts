/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import { knex } from '~/database/knex';
import { accountsTable, identitiesTable } from '~/constants/databaseNames.json';
import { Account, RewardFilter } from '~/utils/types';
import { AccountMethods } from '~/preload/preloadTypes';

function parseAccount(accounts: Account[]): Account[] {
    return accounts.map((account) => {
        return {
            ...account,
            allDecrypted: Boolean(account.allDecrypted),
            isInitial: Boolean(account.isInitial),
            rewardFilter: JSON.parse(
                account.rewardFilter as string
            ) as RewardFilter,
        };
    });
}

function selectAccounts(builder: Knex) {
    return builder
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
}

/**
 * Returns all stored accounts from the database. Attaches the identityName
 * and identityNumber from the identity table.
 */
export async function getAllAccounts(): Promise<Account[]> {
    const accounts: Account[] = await selectAccounts(await knex());

    return parseAccount(accounts);
}

export async function getAccount(
    address: string
): Promise<Account | undefined> {
    const accounts: Account[] = await selectAccounts(await knex()).where({
        address,
    });

    return parseAccount(accounts)[0];
}

export async function insertAccount(account: Account | Account[]) {
    return (await knex())(accountsTable).insert(account);
}

export async function updateAccount(
    address: string,
    updatedValues: Partial<Account>
) {
    const dbValues: Record<string, unknown> = updatedValues;

    if (updatedValues.rewardFilter) {
        dbValues.rewardFilter = JSON.stringify(updatedValues.rewardFilter);
    }

    return (await knex())(accountsTable).where({ address }).update(dbValues);
}

export async function findAccounts(condition: Partial<Account>) {
    const accounts = await (await knex())
        .select()
        .table(accountsTable)
        .where(condition);
    return parseAccount(accounts);
}

export async function removeAccount(accountAddress: string) {
    return (await knex())(accountsTable)
        .where({ address: accountAddress })
        .del();
}

export async function removeInitialAccount(
    identityId: number,
    trx: Knex.Transaction
) {
    const table = (await knex())(accountsTable).transacting(trx);
    return table.where({ identityId, isInitial: 1 }).del();
}

export async function updateInitialAccount(
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

const exposedMethods: AccountMethods = {
    getAll: getAllAccounts,
    getAccount,
    insertAccount,
    updateAccount,
    findAccounts,
    removeAccount,
    updateInitialAccount,
};
export default exposedMethods;
