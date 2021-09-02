/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import { knex } from '~/database/knex';
import {
    accountsTable,
    identitiesTable,
    addressBookTable,
    credentialsTable,
} from '~/constants/databaseNames.json';
import { Account, Credential } from '~/utils/types';
import { AccountMethods } from '~/preload/preloadTypes';

function convertAccountBooleans(accounts: Account[]) {
    return accounts.map((account) => {
        return {
            ...account,
            allDecrypted: Boolean(account.allDecrypted),
            isInitial: Boolean(account.isInitial),
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

    return convertAccountBooleans(accounts);
}

export async function getAccount(
    address: string
): Promise<Account | undefined> {
    const accounts: Account[] = await selectAccounts(await knex()).where({
        address,
    });

    return convertAccountBooleans(accounts)[0];
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

export async function findAccounts(condition: Partial<Account>) {
    const accounts = await (await knex())
        .select()
        .table(accountsTable)
        .where(condition);
    return convertAccountBooleans(accounts);
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

/** Inserts the given account and credential transactionally
 * Also inserts a addressbookentry for the account, if it does not already exist.
 */
async function insertAccountAndCredential(
    account: Account,
    credential: Credential,
    note: string
) {
    return (await knex()).transaction(async (t) => {
        const abe = await t
            .table(addressBookTable)
            .where({ address: account.address })
            .first()
            .select();
        if (abe) {
            await t.table(accountsTable).insert({ ...account, name: abe.name });
            await t
                .table(addressBookTable)
                .where({ address: account.address })
                .update({ readOnly: true });
        } else {
            await t.table(accountsTable).insert(account);
            await t.table(addressBookTable).insert({
                address: account.address,
                name: account.name,
                readOnly: true,
                note,
            });
        }
        await t.table(credentialsTable).insert(credential);
    });
}

const exposedMethods: AccountMethods = {
    getAll: getAllAccounts,
    getAccount,
    insertAccount,
    updateAccount,
    findAccounts,
    removeAccount,
    updateInitialAccount,
    insertAccountAndCredential,
};
export default exposedMethods;
