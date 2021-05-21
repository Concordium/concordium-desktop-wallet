import { knex } from './knex';
import { genesisTable } from '../constants/databaseNames.json';
import { Genesis } from './types';

export async function getGenesis(): Promise<Genesis> {
    return (await knex()).table(genesisTable).first();
}

export async function setGenesis(genesisBlock: string) {
    const table = (await knex())(genesisTable);
    return table.insert({ genesisBlock });
}
