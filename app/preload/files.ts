import AdmZip from 'adm-zip';
import { ipcRenderer, OpenDialogOptions, SaveDialogOptions } from 'electron';
import fs from 'fs';
import { getDatabaseFilename } from '~/database/knexfile';
import { SaveFileData, FileMethods } from '~/preload/preloadTypes';
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

async function saveZipFile(files: SaveFileData[]) {
    const zip = new AdmZip();
    for (const file of files) {
        zip.addFile(file.filename, file.data);
    }

    const opts = {
        title: 'Save Account Reports',
        defaultPath: 'reports.zip',
        filters: [{ name: 'zip', extensions: ['zip'] }],
    };

    const saveFileDialog = await ipcRenderer.invoke(
        ipcCommands.saveFileDialog,
        opts
    );
    if (saveFileDialog.canceled) {
        return false;
    }

    if (!saveFileDialog.filePath) {
        return Promise.reject(
            new Error('No file path was selected by the user.')
        );
    }

    return saveFile(saveFileDialog.filePath, zip.toBuffer());
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
    saveZipFileDialog: saveZipFile,
};

export default exposedMethods;
