import { Knex } from 'knex';
import { Global } from '../utils/types';
import { knex } from './knex';
import { globalTable } from '../constants/databaseNames.json';

export async function getGlobal(): Promise<Global> {
    return (await knex()).table(globalTable).first();
}

export async function setGlobal(global: Global, trx: Knex.Transaction) {
    const table = (await knex())(globalTable).transacting(trx);
    return table.insert(global);
}
