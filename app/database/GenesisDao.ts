import { Knex } from 'knex';
import { knex } from './knex';
import { genesisTable } from '../constants/databaseNames.json';
import { Genesis } from './types';

export async function getGenesis(): Promise<Genesis> {
    return (await knex()).table(genesisTable).first();
}

export async function setGenesis(genesisBlock: string, trx: Knex.Transaction) {
    const table = (await knex())(genesisTable).transacting(trx);
    return table.insert({ genesisBlock });
}
