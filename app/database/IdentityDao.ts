import { Identity } from '../utils/types';
import knex from './knex';
import identityJson from './identity.json';

const identitiesTable = 'identities';

export async function getAllIdentities(): Promise<Identity[]> {
    let identities = await knex.select().table(identitiesTable);
    return identities;
}

export async function insertIdentity(identity: Identity) {
    // TODO Remove test code.
    var identityObject = identityJson;
    identity.identityObject = JSON.stringify(identityObject);
    return await knex(identitiesTable).insert(identity);
}
