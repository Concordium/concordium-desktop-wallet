import { Identity } from '../utils/types';
import knex from './knex';
import { identitiesTable } from '../constants/databaseNames.json';

/**
 * Get the id for the next identity to be created with the hardware wallet
 * with the given identifier. The id depends on the hardware wallet, as the
 * keys used for creating the identity are pulled from the hardware wallet.
 *
 * @param hwWallet the pairing-key for the hardware wallet
 * @returns the id for the next identity to be created by the given hardware wallet
 */
export async function getNextId(hwWallet: string): Promise<number> {
    return (await knex())
        .select()
        .table(identitiesTable)
        .where({ hwWallet })
        .count();
}

export async function getAllIdentities(): Promise<Identity[]> {
    return (await knex()).select().table(identitiesTable);
}

// TODO Clean up this temp import hack.
export async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    // if (Array.isArray(identity)) {
    //     const withHwWallet = identity.map((id) => {
    //         return { ...id, hwWallet: 'f6a810aae60c3a35269d5d82aca5ccb9f875118146c761ad53bfb9fc70814280' };
    //     });
    //     return (await knex())(identitiesTable).insert(withHwWallet);
    // }
    // return (await knex())(identitiesTable).insert({
    //     ...identity,
    //     hwWallet: 'f6a810aae60c3a35269d5d82aca5ccb9f875118146c761ad53bfb9fc70814280',
    // });

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
