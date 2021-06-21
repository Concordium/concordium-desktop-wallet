import { IpcMain } from 'electron';
import { Hex, WalletEntry, WalletType } from '~/utils/types';
import { knex } from '~/database/knex';
import { walletTable } from '~/constants/databaseNames.json';
import ipcCommands from '~/constants/ipcCommands.json';

async function getWalletId(identifier: Hex) {
    const table = (await knex())(walletTable);
    const result: WalletEntry = await table
        .where('identifier', identifier)
        .first();
    if (result === undefined) {
        return undefined;
    }
    return result.id;
}

async function insertWallet(identifier: Hex, type: WalletType) {
    const table = (await knex())(walletTable);
    return (await table.insert({ identifier, type }))[0];
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.dbGetWalletId,
        async (_event, identifier: Hex) => {
            return getWalletId(identifier);
        }
    );

    ipcMain.handle(
        ipcCommands.database.dbInsertWallet,
        async (_event, identifier: Hex, type: WalletType) => {
            return insertWallet(identifier, type);
        }
    );
}
