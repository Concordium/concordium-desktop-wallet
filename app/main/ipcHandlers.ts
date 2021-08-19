import axios from 'axios';
import {
    app,
    shell,
    BrowserWindow,
    ipcMain,
    dialog,
    BrowserView,
    Rectangle,
    SaveDialogOptions,
} from 'electron';
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

    try {
        const response = await axios.get(urlGet, {
            cancelToken: source.token,
            maxRedirects: 0,
            // We also want to accept a 302 redirect, as that is used by the
            // identity provider flow
            validateStatus: (status: number) => status >= 200 && status <= 302,
        });

        return JSON.stringify({
            data: response.data,
            headers: response.headers,
            status: response.status,
        });
    } catch (e) {
        return JSON.stringify({
            error: e,
        });
    } finally {
        clearTimeout(timeout);
    }
}

const redirectUri = 'ConcordiumRedirectToken';

function createExternalView(
    browserView: BrowserView,
    window: BrowserWindow,
    location: string,
    rect: Rectangle
) {
    return new Promise((resolve) => {
        window.setBrowserView(browserView);
        browserView.setBounds(rect);
        browserView.webContents
            .loadURL(location)
            .then(() =>
                browserView.webContents.on(
                    'did-navigate',
                    async (_e, url, httpResponseCode, httpStatusText) => {
                        if (url.includes(redirectUri)) {
                            resolve({
                                result: url.substring(url.indexOf('=') + 1),
                            });
                        } else {
                            resolve({
                                error: `Unexpected response code: ${httpResponseCode}. status: ${httpStatusText}`,
                            });
                        }
                    }
                )
            )
            .catch((e) => resolve({ error: e.message }));
    });
}

export function getUserDataPath() {
    return app.getPath('userData');
}

export function saveFileDialog(opts: SaveDialogOptions) {
    return dialog.showSaveDialog(opts);
}

export default function initializeIpcHandlers(
    mainWindow: BrowserWindow,
    printWindow: BrowserWindow,
    browserView: BrowserView
) {
    // Returns the path to userdata.
    ipcMain.handle(ipcCommands.getUserDataPath, getUserDataPath);

    // Prints the given body.
    ipcMain.handle(ipcCommands.print, (_event, body) => {
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

    ipcMain.handle(
        ipcCommands.createView,
        (_event, location: string, rect: Rectangle) =>
            createExternalView(browserView, mainWindow, location, rect)
    );
    ipcMain.handle(ipcCommands.removeView, () =>
        mainWindow.removeBrowserView(browserView)
    );
    ipcMain.handle(ipcCommands.resizeView, (_event, rect: Rectangle) =>
        browserView.setBounds(rect)
    );

    // Provides access to save file dialog from renderer processes.
    ipcMain.handle(ipcCommands.saveFileDialog, (_event, opts) => {
        return saveFileDialog(opts);
    });

    ipcMain.handle(ipcCommands.openFileDialog, (_event, opts) => {
        return dialog.showOpenDialog(opts);
    });
}
