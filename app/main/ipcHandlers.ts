import axios from 'axios';
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

async function httpsGet(
    urlString: string,
    params: Record<string, string>
): Promise<string> {
    // Setup timeout for axios (it's a little weird, as default timeout
    // settings in axios only concern themselves with response timeout,
    // not a connect timeout).
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
        source.cancel();
    }, 60000);

    const searchParams = new URLSearchParams(params);
    let urlGet: string;
    if (Object.entries(params).length === 0) {
        urlGet = urlString;
    } else {
        urlGet = `${urlString}?${searchParams.toString()}`;
    }

    const response = await axios.get(urlGet, {
        cancelToken: source.token,
        maxRedirects: 0,
        // We also want to accept a 302 redirect, as that is used by the
        // identity provider flow
        validateStatus: (status: number) => status >= 200 && status <= 302,
    });
    clearTimeout(timeout);

    return JSON.stringify({
        data: response.data,
        headers: response.headers,
        status: response.status,
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

    ipcMain.handle(
        ipcCommands.httpsGet,
        (_event, url: string, params: Record<string, string>) => {
            return httpsGet(url, params);
        }
    );

    // Provides access to save file dialog from renderer processes.
    ipcMain.handle(ipcCommands.saveFileDialog, async (_event, opts) => {
        return dialog.showSaveDialog(opts);
    });

    ipcMain.handle(ipcCommands.openFileDialog, async (_event, opts) => {
        return dialog.showOpenDialog(opts);
    });
}
