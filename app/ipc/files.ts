import { IpcMain, dialog } from 'electron';
import fs from 'fs';
import ipcCommands from '~/constants/ipcCommands.json';
import { getDatabaseFilename } from '~/database/knexfile';

async function databaseExists() {
    const databaseFilename = await getDatabaseFilename();
    if (!fs.existsSync(databaseFilename)) {
        return false;
    }
    const stats = fs.statSync(databaseFilename);
    return stats.size > 0;
}

async function saveFile(filepath: string, data: string | Buffer) {
    fs.writeFile(filepath, data, (err) => {
        if (err) {
            return Promise.reject(new Error(`Unable to save file: ${err}`));
        }
        return Promise.resolve(true);
    });
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.databaseExists, async (_event) => {
        return databaseExists();
    });

    ipcMain.handle(
        ipcCommands.saveFile,
        async (_event, filepath: string, data: string | Buffer) => {
            try {
                await saveFile(filepath, data);
                return true;
            } catch {
                return false;
            }
        }
    );

    // Provides access to save file dialog from renderer processes.
    ipcMain.handle(ipcCommands.saveFileDialog, async (_event, opts) => {
        return dialog.showSaveDialog(opts);
    });
}
