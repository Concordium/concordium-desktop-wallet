import { ipcRenderer, OpenDialogOptions, SaveDialogOptions } from 'electron';
import fs from 'fs';
import { getDatabaseFilename } from '~/database/knexfile';
import { FileMethods } from '~/preload/preloadTypes';
import ipcCommands from '~/constants/ipcCommands.json';

/**
 * Checks whether the database has already been created or not.
 * We cannot just check whether the file exists, as the knex configuration
 * will have created an empty file, therefore the check actually checks
 * whether the file has a non-empty size.
 */
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

const exposedMethods: FileMethods = {
    databaseExists,
    // Provides access to save file dialog from renderer processes.
    saveFileDialog: (opts: SaveDialogOptions) =>
        ipcRenderer.invoke(ipcCommands.saveFileDialog, opts),
    openFileDialog: (opts: OpenDialogOptions) =>
        ipcRenderer.invoke(ipcCommands.openFileDialog, opts),
    saveFile: async (filepath: string, data: string | Buffer) => {
        try {
            await saveFile(filepath, data);
            return true;
        } catch {
            return false;
        }
    },
};

export default exposedMethods;
