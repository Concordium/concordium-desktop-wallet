import { ipcRenderer } from 'electron';
import fs from 'fs';
import ipcCommands from '../constants/ipcCommands.json';

/**
 * Opens an 'open file' prompt where the user can select a file to be read. The
 * file path for the chosen file is returned.
 * @param title title of the prompt window
 */
export async function openFileDestination(
    opts: Electron.OpenDialogOptions
): Promise<string> {
    const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        ipcCommands.openFileDialog,
        opts
    );

    if (openDialogValue.canceled) {
        throw new Error('File opening was cancelled by the user.');
    }

    if (openDialogValue.filePaths.length === 1) {
        const fileLocation = openDialogValue.filePaths[0];
        return fileLocation;
    }
    throw new Error('The user did not select a file to open.');
}

/**
 * Opens an 'open file' prompt where the user can select a file to be read. The
 * file data is returned as a raw Buffer.
 * @param title title of the prompt window
 */
export async function openFileRaw(title: string): Promise<Buffer> {
    const fileLocation = await openFileDestination({ title });
    return fs.readFileSync(fileLocation);
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
 * Saves the given data to the given filepath
 * @param data the string or buffer to save to a file
 * @param title the path to save the file
 * @return the promise resolves if the data has been written to file.
 */
function saveFileDirect(
    data: Buffer | string,
    filePath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                reject(new Error(`Unable to save file: ${err}`));
            }
            resolve();
        });
    });
}

/**
 * Opens a 'save file' prompt where the user can select where to save a file, and writes
 * the data to that destination.
 * @param data the string or buffer to save to a file
 * @param title the title of the save file window
 * @param defaultPath the default path that the save window starts on. Can be used just to set default file name.
 * @return the promise resolves true when the data has been written to file. if the result is false, then the user cancelled.
 */
export async function saveFile(
    data: Buffer | string,
    opts: Electron.SaveDialogOptions
): Promise<boolean> {
    const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
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

    await saveFileDirect(data, saveFileDialog.filePath);
    return true;
}

/**
 * Saves the given data to the given filepath
 * @param data the string or buffer to save to a file
 * @param title the path to save the file
 * @return the promise resolves if the data has been written to file.
 */
export async function saveMultipleFiles(
    datas: [string, Buffer | string][],
    title = 'Choose directory'
): Promise<void> {
    let fileLocation;
    try {
        fileLocation = await openFileDestination({
            title,
            properties: ['openDirectory'],
        });
    } catch (e) {
        return;
    }
    for (const [fileName, data] of datas) {
        await saveFileDirect(data, `${fileLocation}/${fileName}`);
    }
}
