/**
 * Opens an 'open file' prompt where the user can select a file to be read. The
 * file path for the chosen file is returned.
 * @param opts Options for the dialog window
 */
export async function openFileDestination(
    opts: Electron.OpenDialogOptions
): Promise<string> {
    const openDialogValue: Electron.OpenDialogReturnValue = await window.files.openFileDialog(
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
 * Opens a 'save file' prompt where the user can select where to save a file, and returns the chosen destination.
 * @param opts options for the dialog
 * @return returns the chosen destination, or undefined if the dialog was canceled
 */
export async function chooseFileDestination(
    opts: Electron.SaveDialogOptions
): Promise<string | undefined> {
    const saveFileDialog: Electron.SaveDialogReturnValue = await window.files.saveFileDialog(
        opts
    );

    if (saveFileDialog.canceled) {
        return undefined;
    }

    if (!saveFileDialog.filePath) {
        throw new Error('No file path was selected by the user.');
    }

    return saveFileDialog.filePath;
}

/**
 * Opens a 'save file' prompt where the user can select where to save a file, and writes
 * the data to that destination.
 * @param data the string or buffer to save to a file
 * @param opts options for the dialog
 * @return the promise resolves true when the data has been written to file. if the result is false, then the user cancelled.
 */
export default async function saveFile(
    data: Buffer | string,
    opts: Electron.SaveDialogOptions
): Promise<boolean> {
    const filePath = await chooseFileDestination(opts);

    if (!filePath) {
        return false;
    }

    return window.files.saveFile(filePath, data);
}

/**
 * Saves the given data to the directory selected by the user.
 * @param data the string or buffer to save to a file
 * @param title title for the open directory prompt
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
        await window.files.saveFile(`${fileLocation}/${fileName}`, data);
    }
}
