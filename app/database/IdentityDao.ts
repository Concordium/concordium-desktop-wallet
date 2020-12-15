import { Identity } from '../utils/types';
import knex from './knex';
import identityJson from './identity.json';

const identitiesTable = 'identities';

export async function getAllIdentities(): Promise<Identity[]> {
    return knex.select().table(identitiesTable);
}

export async function insertIdentity(identity: Identity) {
    // TODO Remove test code.
    const identityObject = identityJson;
    identity.identityObject = JSON.stringify(identityObject);
    return knex(identitiesTable).insert(identity);
}
