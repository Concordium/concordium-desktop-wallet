import { Global } from '~/utils/types';
import { setGenesis } from './GenesisDao';
import { setGlobal } from './GlobalDao';
import { knex } from './knex';

/**
 * Transactionally sets the genesis block and global values in the database.
 */
export default async function setGenesisAndGlobal(
    genesisBlock: string,
    global: Global
) {
    const db = await knex();
    await db.transaction((trx) => {
        setGenesis(genesisBlock, trx)
            .then(() => {
                return setGlobal(global, trx);
            })
            .then(trx.commit)
            .catch(trx.rollback);
    });
}
