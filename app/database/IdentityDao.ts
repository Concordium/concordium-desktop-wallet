import { Identity } from '../utils/types';
import knex from './knex';
import { identitiesTable } from '../constants/databaseNames.json';

export async function getNextId(): Promise<number> {
    return (
        (
            await (await knex())
                .select('seq')
                .table('sqlite_sequence')
                .where('name', identitiesTable)
                .first()
        ).seq + 1
    );
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
