import { knex } from './knex';
import { genesisTable, globalTable } from '../constants/databaseNames.json';
import { Genesis } from './types';
import { Global } from '~/utils/types';

export async function getGenesis(): Promise<Genesis> {
    return (await knex()).table(genesisTable).first();
}

export async function setGenesis(genesisBlock: string) {
    const table = (await knex())(genesisTable);
    return table.insert({ genesisBlock });
}

/**
 * Transactionally sets the genesis block and global values in the database.
 */
export async function setGenesisAndGlobal(
    genesisBlock: string,
    global: Global
) {
    const db = await knex();
    await db.transaction((trx) => {
        db(genesisTable)
            .transacting(trx)
            .insert({ genesisBlock })
            .then(() => {
                return db(globalTable).transacting(trx).insert(global);
            })
            .then(trx.commit)
            .catch(trx.rollback);
    });
}
