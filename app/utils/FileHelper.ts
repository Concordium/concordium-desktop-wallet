import { ipcRenderer } from 'electron';
import fs from 'fs';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Opens an 'open file' prompt where the user can select a file to be read. The
 * file data is returned as a raw Buffer.
 * @param title title of the prompt window
 */
export async function openFileRaw(title: string): Promise<Buffer> {
    const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        ipcCommands.openFileDialog,
        title
    );

    if (openDialogValue.canceled) {
        throw new Error('File opening was cancelled by the user.');
    }

    if (openDialogValue.filePaths.length === 1) {
        const fileLocation = openDialogValue.filePaths[0];
        return fs.readFileSync(fileLocation);
    }
    throw new Error('The user did not select a file to open.');
}

/**
 * Opens an 'open file' prompt where the user can select a file to be read. The
 * file is interpreted as an UTF-8 string.
 * @param title title of the prompt window
 */
export async function openFile(title: string): Promise<string> {
    return (await openFileRaw(title)).toString('utf-8');
}

/**
 * Opens a 'save file' prompt where the user can select where to save a file, and writes
 * the data to that destination.
 * @param data the string to save to a file
 * @param title the title of the save file window
 * @return the promise resolves true when the data has been written to file. if the result is false, then the user cancelled.
 */
export async function saveFile(data: string, title: string): Promise<boolean> {
    const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
        ipcCommands.saveFileDialog,
        title
    );

    if (saveFileDialog.canceled) {
        return false;
    }

    return new Promise<boolean>((resolve, reject) => {
        if (!saveFileDialog.filePath) {
            reject(new Error('No file path was selected by the user.'));
        } else {
            fs.writeFile(saveFileDialog.filePath, data, (err) => {
                if (err) {
                    reject(new Error(`Unable to save file: ${err}`));
                }
                resolve(true);
            });
        }
    });
}
