import AdmZip from 'adm-zip';
import { IpcMain, dialog } from 'electron';
import fs from 'fs';
import ipcCommands from '~/constants/ipcCommands.json';
import { getDatabaseFilename } from '~/database/knexfile';

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

export interface SaveFileData {
    filename: string;
    data: Buffer;
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

    const saveFileDialog = await dialog.showSaveDialog(opts);
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

    ipcMain.handle(
        ipcCommands.saveZipFileDialog,
        async (_event, files: SaveFileData[]) => {
            return saveZipFile(files);
        }
    );

    ipcMain.handle(ipcCommands.openFileDialog, async (_event, opts) => {
        return dialog.showOpenDialog(opts);
    });
}
