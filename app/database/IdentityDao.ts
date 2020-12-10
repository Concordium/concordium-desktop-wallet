import { Identity } from '../utils/types';
import knex from './knex';

const identitiesTable = 'identities';

export async function getAllIdentities() {
    return await knex.select().table(identitiesTable);
}

export async function insertIdentity(identity: Identity) {
    return await knex(identitiesTable).insert(identity);
}
