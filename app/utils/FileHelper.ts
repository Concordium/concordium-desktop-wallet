import { ipcRenderer } from 'electron';
import fs from 'fs';

/**
 * Opens an 'open file' prompt where the user can select a file to be read.
 * @param title title of the prompt window
 */
export async function openFile(title: string): Promise<string> {
    const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        'OPEN_FILE_DIALOG',
        title
    );

    if (openDialogValue.canceled) {
        return Promise.reject(
            new Error('File opening was cancelled by the user.')
        );
    }

    if (openDialogValue.filePaths.length === 1) {
        const fileLocation = openDialogValue.filePaths[0];
        const fileAsString = fs.readFileSync(fileLocation, {
            encoding: 'utf-8',
        });
        return fileAsString;
    }
    return Promise.reject(new Error('The user did not select a file to open.'));
}

/**
 * Opens a 'save file' promot where the user can select where to save a file.
 * @param data the string to save to a file
 * @param title the title of the save file window
 */
export async function saveFile(data: string, title: string) {
    const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
        'SAVE_FILE_DIALOG',
        title
    );

    if (saveFileDialog.canceled) {
        return Promise.reject(
            new Error('Saving file was cancelled by the user.')
        );
    }

    if (saveFileDialog.filePath) {
        fs.writeFile(saveFileDialog.filePath, data, (err) => {
            if (err) {
                return Promise.reject(new Error(`Unable to save file: ${err}`));
            }
            return Promise.resolve();
        });
    }
    return Promise.resolve();
}
