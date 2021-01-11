import { Identity } from '../utils/types';
import knex from './knex';
import { identitiesTable } from '../constants/databaseNames.json';

export async function getNextId(): Promise<number> {
    try {
        const currentId = (
            await (await knex())
                .select('seq')
                .table('sqlite_sequence')
                .where('name', identitiesTable)
                .first()
        ).seq;
        return currentId + 1;
    } catch (e) {
        console.log(e);
        return 1; // TODO: First check if the table exists, instead of trying and failing
    }
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
