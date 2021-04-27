import { Identity } from '../utils/types';
import knex from './knex';
import { identitiesTable } from '../constants/databaseNames.json';

export async function getNextId(): Promise<number> {
    const result = await (await knex())
        .select('seq')
        .table('sqlite_sequence')
        .where('name', identitiesTable)
        .first();
    if (result === undefined) {
        // this case means that there are no identities added, and so we default to the
        // starting value of AUTOINCREMENT:
        return 1;
    }
    const currentId = result.seq;
    return currentId + 1;
}

export async function getAllIdentities(): Promise<Identity[]> {
    return (await knex()).select().table(identitiesTable);
}

// TODO Clean up this temp import hack.
export async function insertIdentity(identity: Partial<Identity> | Identity[]) {
    if (Array.isArray(identity)) {
        const withHwWallet = identity.map((id) => {
            return { ...id, hwWallet: 'Testing' };
        });
        return (await knex())(identitiesTable).insert(withHwWallet);
    }
    return (await knex())(identitiesTable).insert({
        ...identity,
        hwWallet: 'Testing',
    });
}

export async function updateIdentity(
    identityName: string,
    updatedValues: Record<string, unknown>
) {
    return (await knex())(identitiesTable)
        .where({ name: identityName })
        .update(updatedValues);
}
