/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Knex } from 'knex';
import { knex } from '~/database/knex';
import databaseNames from '~/constants/databaseNames.json';
import { Identity, IdentityStatus, IdentityVersion } from '~/utils/types';
import { IdentityMethods } from '~/preload/preloadTypes';

/**
 * Get the identity number to be used to create the next identity with
 * the wallet with the given id.
 * @param walletId the database id key for the wallet used
 * @returns the id for the next identity to be created by the given wallet
 */
export async function getNextIdentityNumber(walletId: number): Promise<number> {
    const maxIdentityNumber = await (await knex())
        .table<Identity>(databaseNames.identitiesTable)
        .where('walletId', walletId)
        .max<{ maxIdentityNumber: number }>(
            'identityNumber as maxIdentityNumber'
        )
        .first();

    if (
        maxIdentityNumber === undefined ||
        maxIdentityNumber.maxIdentityNumber === null
    ) {
        return 0;
    }

    return maxIdentityNumber.maxIdentityNumber + 1;
}

async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    return (await knex())(databaseNames.identitiesTable).insert(identity);
}

async function updateIdentity(
    id: number,
    updatedValues: Record<string, unknown>
) {
    return (await knex())(databaseNames.identitiesTable)
        .where({ id })
        .update(updatedValues);
}

/**
 * Find all the identities for a given wallet.
 * @returns a list of identities that have been created from the supplied wallet
 */
async function getIdentitiesForWallet(walletId: number): Promise<Identity[]> {
    return (await knex())
        .select()
        .table(databaseNames.identitiesTable)
        .where({ walletId });
}

async function removePendingIdentity(id: number, trx: Knex.Transaction) {
    const table = (await knex())(databaseNames.identitiesTable).transacting(
        trx
    );
    return table.where({ id }).del();
}

/**
 * Transactionally sets an identity to 'Rejected' and deletes its corresponding
 * initial account.
 * @param identityId the identity to reject
 */
async function rejectIdentity(identityId: number, detail: string) {
    (await knex()).transaction(async (trx) => {
        await trx(databaseNames.identitiesTable)
            .where({ id: identityId })
            .update({ status: IdentityStatus.Rejected, detail });
    });
}

/**
 * Transactionally inserts an identity and its initial account.
 * @returns the identityId of the inserted identity
 */
async function insertPendingIdentity(identity: Partial<Identity>) {
    return (await knex()).transaction(async (trx) => {
        const identityId = (
            await trx.table(databaseNames.identitiesTable).insert(identity)
        )[0];
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
async function confirmIdentity(identityId: number, identityObjectJson: string) {
    (await knex()).transaction(async (trx) => {
        await trx(databaseNames.identitiesTable)
            .where({ id: identityId })
            .update({
                status: IdentityStatus.Confirmed,
                identityObject: identityObjectJson,
            });
    });
}

async function removeIdentity(identityId: number) {
    const db = await knex();
    await db.transaction((trx) => {
        return removePendingIdentity(identityId, trx)
            .then(trx.commit)
            .catch(trx.rollback);
    });
}

export async function getIdentityVersion(
    identityId: number
): Promise<IdentityVersion | undefined> {
    const identity = await (await knex())<Identity>(
        databaseNames.identitiesTable
    )
        .where({ id: identityId })
        .first();
    return identity?.version;
}

const exposedMethods: IdentityMethods = {
    getNextIdentityNumber,
    insert: insertIdentity,
    update: updateIdentity,
    getIdentitiesForWallet,
    rejectIdentity,
    removeIdentity,
    confirmIdentity,
    insertPendingIdentity,
};

export default exposedMethods;
