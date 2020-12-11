import { Identity } from '../utils/types';
import knex from './knex';
var fs = require("fs");

const identitiesTable = 'identities';

export async function getAllIdentities(): Promise<Identity[]> {
    let identities = await knex.select().table(identitiesTable);
    return identities;
}

export async function insertIdentity(identity: Identity) {
    // TODO Remove test code.
    var identityObject = fs.readFileSync("./identity.json").toString('utf-8');
    identity.identityObject = identityObject;
    return await knex(identitiesTable).insert(identity);
}
