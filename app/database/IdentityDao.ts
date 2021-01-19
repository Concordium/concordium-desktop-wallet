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

export async function insertIdentity(identity: Identity) {
    return (await knex())(identitiesTable).insert(identity);
}

export async function updateIdentity(identityName: string, updatedValues) {
    return (await knex())(identitiesTable)
        .where({ name: identityName })
        .update(updatedValues);
}
