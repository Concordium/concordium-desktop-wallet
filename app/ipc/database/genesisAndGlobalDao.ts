import { IpcMain } from 'electron';
import { Knex } from 'knex';
import { knex } from '~/database/knex';
import { globalTable, genesisTable } from '~/constants/databaseNames.json';
import { Global } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

async function setGenesis(genesisBlock: string, trx: Knex.Transaction) {
    const table = (await knex())(genesisTable).transacting(trx);
    return table.insert({ genesisBlock });
}

async function setGlobal(global: Global, trx: Knex.Transaction) {
    const table = (await knex())(globalTable).transacting(trx);
    return table.insert(global);
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.genesisAndGlobal.setValue,
        async (_event, genesisBlock: string, global: Global) => {
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
    );
}
