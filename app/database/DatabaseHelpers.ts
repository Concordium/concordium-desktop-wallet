import { Global } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

/**
 * Transactionally sets the genesis block and global values in the database.
 */
export default async function setGenesisAndGlobal(
    genesisBlock: string,
    global: Global
) {
    return window.ipcRenderer.invoke(
        ipcCommands.database.genesisAndGlobal.setValue,
        genesisBlock,
        global
    );
}
