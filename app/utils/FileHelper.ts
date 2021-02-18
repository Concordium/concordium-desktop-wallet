import { ipcRenderer } from 'electron';
import fs from 'fs';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Opens an 'open file' prompt where the user can select a file to be read.
 * @param title title of the prompt window
 */
export async function openFile(title: string): Promise<string> {
    const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        ipcCommands.openFileDialog,
        title
    );

    if (openDialogValue.canceled) {
        throw new Error('File opening was cancelled by the user.');
    }

    if (openDialogValue.filePaths.length === 1) {
        const fileLocation = openDialogValue.filePaths[0];
        const fileAsString = fs.readFileSync(fileLocation, {
            encoding: 'utf-8',
        });
        return fileAsString;
    }
    throw new Error('The user did not select a file to open.');
}

/**
 * Opens a 'save file' prompt where the user can select where to save a file, and writes
 * the data to that destination.
 * @param data the string to save to a file
 * @param title the title of the save file window
 */
export async function saveFile(data: string, title: string) {
    const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
        ipcCommands.saveFileDialog,
        title
    );

    if (saveFileDialog.canceled) {
        throw new Error('Saving file was cancelled by the user.');
    }

    return new Promise<void>((resolve, reject) => {
        if (!saveFileDialog.filePath) {
            reject(new Error('No file path was selected by the user.'));
        } else {
            fs.writeFile(saveFileDialog.filePath, data, (err) => {
                if (err) {
                    reject(new Error(`Unable to save file: ${err}`));
                }
                resolve();
            });
        }
    });
}
