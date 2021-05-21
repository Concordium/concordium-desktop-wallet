import { Global } from '../utils/types';
import { knex } from './knex';
import { globalTable } from '../constants/databaseNames.json';

export async function getGlobal(): Promise<Global> {
    return (await knex()).table(globalTable).first();
}

export async function setGlobal(global: Global) {
    const table = (await knex())(globalTable);
    return table.insert(global);
}
