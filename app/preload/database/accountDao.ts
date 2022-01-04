/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import { knex } from '~/database/knex';
import databaseNames from '~/constants/databaseNames.json';
import {
    Account,
    Identity,
    AccountAndCredentialPairs,
    Credential,
    TransactionFilter,
} from '~/utils/types';
import { AccountMethods } from '~/preload/preloadTypes';

function parseAccounts(accounts: Account[]): Account[] {
    return accounts.map((account) => {
        return {
            ...account,
            allDecrypted: Boolean(account.allDecrypted),
            isInitial: Boolean(account.isInitial),
            transactionFilter: JSON.parse(
                account.transactionFilter as string
            ) as TransactionFilter,
        };
    });
}

export function serializeAccountFields(account: Partial<Account>) {
    const dbValues: Record<string, unknown> = account;

    if (account.transactionFilter) {
        dbValues.transactionFilter = JSON.stringify(account.transactionFilter);
    }

    return dbValues;
}

function prepareAccounts(accounts: Account | Account[]) {
    if (Array.isArray(accounts)) {
        return accounts.map(serializeAccountFields);
    }

    return serializeAccountFields(accounts);
}

function selectAccounts(builder: Knex) {
    return builder
        .table(databaseNames.accountsTable)
        .join(
            databaseNames.identitiesTable,
            `${databaseNames.accountsTable}.identityId`,
            '=',
            `${databaseNames.identitiesTable}.id`
        )
        .select(
            `${databaseNames.accountsTable}.*`,
            `${databaseNames.identitiesTable}.name as identityName`,
            `${databaseNames.identitiesTable}.identityNumber as identityNumber`
        );
}

/**
 * Returns all stored accounts from the database. Attaches the identityName
 * and identityNumber from the identity table.
 */
export async function getAllAccounts(): Promise<Account[]> {
    const accounts: Account[] = await selectAccounts(await knex());

    return parseAccounts(accounts);
}

export async function getAccount(
    address: string
): Promise<Account | undefined> {
    const accounts: Account[] = await selectAccounts(await knex()).where({
        address,
    });

    return parseAccounts(accounts)[0];
}

export async function insertAccount(account: Account | Account[]) {
    return (await knex())(databaseNames.accountsTable).insert(
        prepareAccounts(account)
    );
}

export async function updateAccount(
    address: string,
    updatedValues: Partial<Account>
) {
    return (await knex())(databaseNames.accountsTable)
        .where({ address })
        .update(serializeAccountFields(updatedValues));
}

export async function findAccounts(condition: Partial<Account>) {
    const accounts = await (await knex())
        .select()
        .table(databaseNames.accountsTable)
        .where(condition);
    return parseAccounts(accounts);
}

export async function removeAccount(accountAddress: string) {
    return (await knex())(databaseNames.accountsTable)
        .where({ address: accountAddress })
        .del();
}

export async function removeInitialAccount(
    identityId: number,
    trx: Knex.Transaction
) {
    const table = (await knex())(databaseNames.accountsTable).transacting(trx);
    return table.where({ identityId, isInitial: 1 }).del();
}

export async function updateInitialAccount(
    identityId: number,
    updatedValues: Partial<Account>
) {
    return (await knex())
        .select()
        .table(databaseNames.accountsTable)
        .where({ identityId, isInitial: 1 })
        .first()
        .update(serializeAccountFields(updatedValues));
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
        .table(databaseNames.addressBookTable)
        .where({ address: account.address })
        .first()
        .select();
    if (abe) {
        await transaction
            .table(databaseNames.accountsTable)
            .insert(serializeAccountFields({ ...account, name: abe.name }));
        await transaction
            .table(databaseNames.addressBookTable)
            .where({ address: account.address })
            .update({ readOnly: true });
    } else {
        await transaction
            .table(databaseNames.accountsTable)
            .insert(serializeAccountFields(account));
        await transaction.table(databaseNames.addressBookTable).insert({
            address: account.address,
            name: account.name,
            readOnly: true,
            note,
        });
    }
}

/**
 * Inserts account (if it doesn't exist already) and the credential, as part of the given transaction.
 */
async function insertFromRecovery(
    account: Account,
    credential: Credential,
    transaction: Knex.Transaction
): Promise<void> {
    const accountInDatabase = await transaction
        .table(databaseNames.accountsTable)
        .where({ address: account.address })
        .first()
        .select();
    if (!accountInDatabase) {
        await insertAccountTransactionally(
            account,
            'Recovered account',
            transaction
        );
    }
    await transaction.table(databaseNames.credentialsTable).insert(credential);
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
            await transaction
                .table(databaseNames.identitiesTable)
                .insert(identity)
        )[0];
        for (const pair of recovered) {
            const account = { ...pair.account, identityId };
            const credential = { ...pair.credential, identityId };
            await insertFromRecovery(account, credential, transaction);
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
            await insertFromRecovery(account, credential, transaction);
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
