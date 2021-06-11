import { Global } from '~/utils/types';

/**
 * Transactionally sets the genesis block and global values in the database.
 */
export default async function setGenesisAndGlobal(
    genesisBlock: string,
    global: Global
) {
    return window.ipcRenderer.invoke(
        'dbSetGenesisAndGlobal',
        genesisBlock,
        global
    );
}
