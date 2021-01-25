import { ipcRenderer } from 'electron';
import fs from 'fs';

/**
 *  Starts the file dialog, and returns the content
 *  of the chosen file.
 *  The first parameter specifies the encoding of
 * the content when returned.
 */
export async function loadFile(encoding = 'utf-8') {
    const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        'OPEN_FILE_DIALOG',
        'Load transaction'
    );

    if (openDialogValue.canceled) {
        return undefined;
    }

    if (openDialogValue.filePaths.length === 1) {
        const fileLocation = openDialogValue.filePaths[0];
        const fileString = fs.readFileSync(fileLocation, {
            encoding,
        });

        return fileString;
    }
    return undefined;
}

/**
 * Start the file dialog, and saves the given data to the chosen file.
 * If the method returns true, the operation was succesful,
 * if it returns false, then the operation was canceled.
 * otherwise the function will throw an error.
 */
export async function saveToFile(data) {
    const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke(
        'SAVE_FILE_DIALOG',
        'Export signed transaction'
    );
    if (saveFileDialog.canceled) {
        return false;
    }

    if (saveFileDialog.filePath) {
        return new Promise((resolve, reject) => {
            fs.writeFile(
                saveFileDialog.filePath,
                JSON.stringify(data),
                (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                }
            );
        });
    }
    return false;
}
