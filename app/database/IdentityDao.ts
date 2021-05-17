import { Identity } from '../utils/types';
import { knex } from './knex';
import { identitiesTable } from '../constants/databaseNames.json';

/**
 * Get the identity number to be used to create the next identity with
 * the wallet with the given id.
 * @param walletId the database id key for the wallet used
 * @returns the id for the next identity to be created by the given wallet
 */
export async function getNextIdentityNumber(walletId: number): Promise<number> {
    const model = (await knex())
        .table(identitiesTable)
        .where('walletId', walletId);
    const totalCount = await model.clone().count();
    return parseInt(totalCount[0]['count(*)'].toString(), 10);
}

export async function getAllIdentities(): Promise<Identity[]> {
    return (await knex()).select().table(identitiesTable);
}

export async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    return (await knex())(identitiesTable).insert(identity);
}

export async function updateIdentity(
    identityName: string,
    updatedValues: Record<string, unknown>
) {
    return (await knex())(identitiesTable)
        .where({ name: identityName })
        .update(updatedValues);
}

/**
 * Find all the identities for a given wallet.
 * @returns a list of identities that have been created from the supplied wallet
 */
export async function getIdentitiesForWallet(
    walletId: number
): Promise<Identity[]> {
    return (await knex()).select().table(identitiesTable).where({ walletId });
}
