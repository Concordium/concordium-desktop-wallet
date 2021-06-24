import { IpcMain } from 'electron';
import { Setting } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';
import { settingsTable } from '~/constants/databaseNames.json';
import { knex } from '~/database/knex';

async function updateEntry(setting: Setting) {
    return (await knex())(settingsTable)
        .where({ name: setting.name })
        .update(setting);
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.database.settings.update,
        async (_event, setting: Setting) => {
            return updateEntry(setting);
        }
    );
}
