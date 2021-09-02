/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import { knex } from '~/database/knex';
import {
    accountsTable,
    identitiesTable,
    addressBookTable,
    credentialsTable,
} from '~/constants/databaseNames.json';
import { Account, Identity, AccountAndCredentialPairs } from '~/utils/types';
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

/** Inserts the given account as part of a transaction
 * Also inserts a addressbookentry for the account, if it does not already exist.
 */
async function insertAccountTransactionally(
    account: Account,
    note: string,
    transaction: Knex.Transaction
) {
    const abe = await transaction
        .table(addressBookTable)
        .where({ address: account.address })
        .first()
        .select();
    if (abe) {
        await transaction
            .table(accountsTable)
            .insert({ ...account, name: abe.name });
        await transaction
            .table(addressBookTable)
            .where({ address: account.address })
            .update({ readOnly: true });
    } else {
        await transaction.table(accountsTable).insert(account);
        await transaction.table(addressBookTable).insert({
            address: account.address,
            name: account.name,
            readOnly: true,
            note,
        });
    }
}

/** Inserts accounts and credentials for a specific identity, from recovery.
 * The identity is first inserted, and its given id is attached to the accounts and credentials.
 */
async function insertFromRecoveryNewIdentity(
    recovered: AccountAndCredentialPairs,
    identity: Omit<Identity, 'id'>
) {
    return (await knex()).transaction(async (transaction) => {
        const identityId = (
            await transaction.table(identitiesTable).insert(identity)
        )[0];
        for (const pair of recovered) {
            const account = { ...pair.account, identityId };
            const credential = { ...pair.credential, identityId };
            const { address } = account;
            const accountExists =
                (
                    await transaction
                        .table(accountsTable)
                        .where({ address })
                        .select()
                ).length > 0;
            if (!accountExists) {
                await insertAccountTransactionally(
                    account,
                    'Recovered account',
                    transaction
                );
            }
            await transaction.table(credentialsTable).insert(credential);
        }
    });
}

/** Inserts accounts and credentials for an existing identity, from recovery.
 */
async function insertFromRecoveryExistingIdentity(
    recovered: AccountAndCredentialPairs
) {
    return (await knex()).transaction(async (transaction) => {
        for (const { account, credential } of recovered) {
            const { address } = account;
            const accountExists = (await findAccounts({ address })).length > 0;
            if (!accountExists) {
                insertAccountTransactionally(
                    account,
                    'Recovered account',
                    transaction
                );
            }
            await transaction.table(credentialsTable).insert(credential);
        }
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
    insertFromRecoveryNewIdentity,
    insertFromRecoveryExistingIdentity,
};
export default exposedMethods;
