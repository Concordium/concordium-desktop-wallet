import { Knex } from 'knex';
import { knex } from '~/database/knex';
import databaseNames from '~/constants/databaseNames.json';
import { Global } from '~/utils/types';
import { GenesisAndGlobalMethods } from '~/preload/preloadTypes';

async function setGenesis(genesisBlock: string, trx: Knex.Transaction) {
    const table = (await knex())(databaseNames.genesisTable).transacting(trx);
    return table.insert({ genesisBlock });
}

async function setGlobal(global: Global, trx: Knex.Transaction) {
    const table = (await knex())(databaseNames.globalTable).transacting(trx);
    return table.insert(global);
}

const exposedMethods: GenesisAndGlobalMethods = {
    setValue: async (genesisBlock: string, global: Global) => {
        const db = await knex();
        await db.transaction((trx) => {
            setGenesis(genesisBlock, trx)
                .then(() => {
                    return setGlobal(global, trx);
                })
                .then(trx.commit)
                .catch(trx.rollback);
        });
    },
};
export default exposedMethods;
