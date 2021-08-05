/* eslint-disable @typescript-eslint/no-explicit-any */
import { knex } from '~/database/knex';
import {
    identitiesTable,
    accountsTable,
    credentialsTable,
    addressBookTable,
} from '~/constants/databaseNames.json';
import {
    Account,
    Credential,
    AccountStatus,
    AddressBookEntry,
    Identity,
    IdentityStatus,
} from '~/utils/types';
import { IdentityMethods } from '~/preloadTypes';

export async function getNextIdentityNumber(walletId: number): Promise<number> {
    const model = (await knex())
        .table(identitiesTable)
        .where('walletId', walletId);
    const totalCount = await model.clone().count();
    return parseInt(totalCount[0]['count(*)'].toString(), 10);
}

async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    return (await knex())(identitiesTable).insert(identity);
}

async function updateIdentity(
    id: number,
    updatedValues: Record<string, unknown>
) {
    return (await knex())(identitiesTable).where({ id }).update(updatedValues);
}

async function getIdentitiesForWallet(walletId: number): Promise<Identity[]> {
    return (await knex()).select().table(identitiesTable).where({ walletId });
}

/**
 * Transactionally sets an identity to 'Rejected' and deletes its corresponding
 * initial account.
 * @param identityId the identity to reject
 */
async function rejectIdentityAndDeleteInitialAccount(identityId: number) {
    (await knex()).transaction(async (trx) => {
        await trx(identitiesTable)
            .where({ id: identityId })
            .update({ status: IdentityStatus.Rejected });
        await trx(accountsTable).where({ identityId, isInitial: 1 }).del();
    });
}

/**
 * Transactionally inserts an identity and its initial account.
 * @returns the identityId of the inserted identity
 */
async function insertPendingIdentityAndInitialAccount(
    identity: Partial<Identity>,
    initialAccount: Omit<Account, 'identityId'>
) {
    return (await knex()).transaction(async (trx) => {
        const identityId = (
            await trx.table(identitiesTable).insert(identity)
        )[0];
        const initialAccountWithIdentityId = {
            ...initialAccount,
            identityId,
        };
        await trx.table(accountsTable).insert(initialAccountWithIdentityId);
        return identityId;
    });
}

/**
 * Updates the database entries accordingly after an identity has been
 * confirmed to be created by an identity provider. This includes:
 * - Setting the identity status to 'confirmed'.
 * - Setting the corresponding initial account status to 'confirmed'.
 * - Inserts the corresponding credential into the database.
 * - Adds the initial account as an entry in the address book.
 * All of this happens transactionally.
 */
async function confirmIdentity(
    identityId: number,
    identityObjectJson: string,
    accountAddress: string,
    credential: Credential,
    addressBookEntry: AddressBookEntry
) {
    (await knex()).transaction(async (trx) => {
        await trx(identitiesTable).where({ id: identityId }).update({
            status: IdentityStatus.Confirmed,
            identityObject: identityObjectJson,
        });
        await trx(accountsTable)
            .where({ identityId, isInitial: 1 })
            .first()
            .update({
                status: AccountStatus.Confirmed,
                address: accountAddress,
            });
        await trx(credentialsTable).insert(credential);
        await trx(addressBookTable).insert(addressBookEntry);
    });
}

const initializeIpcHandlers: IdentityMethods = {
    getNextIdentityNumber,
    insert: insertIdentity,
    update: updateIdentity,
    getIdentitiesForWallet,
    rejectIdentityAndDeleteInitialAccount,
    confirmIdentity,
    insertPendingIdentityAndInitialAccount,
};

export default initializeIpcHandlers;
