import { ipcRenderer, OpenDialogOptions, SaveDialogOptions } from 'electron';
import fs from 'fs';
import path from 'path';
import type { Buffer } from 'buffer/';
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

/**
 * Validates that the target path is within an allowed directory.
 * Allowed: user's Downloads, Documents, or a temp directory.
 * Prevents arbitrary file write by compromised renderer.
 */
function isAllowedWritePath(filepath: string): boolean {
    const allowedDirs = [
        path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads'),
        path.join(process.env.USERPROFILE || process.env.HOME || '', 'Documents'),
        process.env.TEMP || process.env.TMP || '/tmp',
    ].filter(Boolean).map((d) => path.resolve(d));

    const resolved = path.resolve(filepath);
    return allowedDirs.some((dir) => resolved.startsWith(dir));
}

async function saveFile(filepath: string, data: string | Buffer) {
    if (!isAllowedWritePath(filepath)) {
        return Promise.reject(new Error('File path not in allowed directory'));
    }
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(filepath, data, (err) => {
            if (err) {
                reject(new Error(`Unable to save file: ${err}`));
            } else {
                resolve();
            }
        });
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
