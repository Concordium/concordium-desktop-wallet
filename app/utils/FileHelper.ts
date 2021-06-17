import ipcCommands, {
    saveFile as saveFileIpc,
} from '../constants/ipcCommands.json';

/**
 * Opens a 'save file' prompt where the user can select where to save a file, and writes
 * the data to that destination.
 * @param data the string or buffer to save to a file
 * @param title the title of the save file window
 * @param defaultPath the default path that the save window starts on. Can be used just to set default file name.
 * @return the promise resolves true when the data has been written to file. if the result is false, then the user cancelled.
 */
export default async function saveFile(
    data: Buffer | string,
    opts: Electron.SaveDialogOptions
): Promise<boolean> {
    const saveFileDialog: Electron.SaveDialogReturnValue = await window.ipcRenderer.invoke(
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

    return window.ipcRenderer.invoke(
        saveFileIpc,
        saveFileDialog.filePath,
        data
    );
}
