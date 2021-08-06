import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { PrintErrorTypes } from '~/utils/types';
import ipcCommands from '~/constants/ipcCommands.json';

async function print(body: string, printWindow: BrowserWindow) {
    return new Promise<string | void>((resolve, reject) => {
        if (!printWindow) {
            reject(new Error('Internal error: Unable to print'));
        } else {
            printWindow.loadURL(`data:text/html;charset=utf-8,${body}`);
            const content = printWindow.webContents;
            content.once('did-finish-load', () => {
                content.print({}, (success, errorType) => {
                    if (!success) {
                        if (errorType === PrintErrorTypes.Cancelled) {
                            resolve();
                        }
                        resolve(errorType);
                    } else {
                        resolve();
                    }
                });
            });
        }
    });
}

export default function initializeIpcHandlers(printWindow: BrowserWindow) {
    // Returns the path to userdata.
    ipcMain.handle(ipcCommands.getUserDataPath, async () => {
        return app.getPath('userData');
    });

    // Prints the given body.
    ipcMain.handle(ipcCommands.print, async (_event, body) => {
        return print(body, printWindow);
    });

    ipcMain.handle(ipcCommands.openUrl, (_event, url: string) => {
        shell.openExternal(url);
    });

    // Provides access to save file dialog from renderer processes.
    ipcMain.handle(ipcCommands.saveFileDialog, async (_event, opts) => {
        return dialog.showSaveDialog(opts);
    });

    ipcMain.handle(ipcCommands.openFileDialog, async (_event, opts) => {
        return dialog.showOpenDialog(opts);
    });
}
