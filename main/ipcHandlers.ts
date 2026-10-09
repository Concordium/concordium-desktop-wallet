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
import { ViewResponse, ViewResponseStatus } from '~/preload/preloadTypes';

/**
 * Schemes that are considered safe to hand over to the OS via shell.openExternal.
 * Shell command execution (file:, smb:, ms-settings:, shell:) and any other scheme
 * must never be opened from third-party-controlled content, as that would allow
 * arbitrary application launch / code execution on the host machine.
 */
const SAFE_EXTERNAL_SCHEMES = new Set(['https:', 'mailto:']);

function isSafeExternalUrl(url: string): boolean {
    try {
        return SAFE_EXTERNAL_SCHEMES.has(new URL(url).protocol);
    } catch {
        return false;
    }
}

/**
 * Opens a URL in the user's default handler, but only when the URL uses a
 * scheme that cannot trigger local process/command execution.
 */
export async function openExternal(url: string): Promise<void> {
    if (!isSafeExternalUrl(url)) {
        return Promise.reject(new Error('Refusing to open URL with unsafe scheme.'));
    }
    return shell.openExternal(url);
}

/**
 * Determines whether the given URL is allowed to be fetched by the main-process
 * HTTP client. Only publicly routable https URLs are permitted; localhost,
 * private/Link-Local address space, and metadata endpoints are blocked to
 * prevent server-side request forgery from the renderer.
 */
function isAllowedHttpTarget(url: string): boolean {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return false;
    }
    if (parsed.protocol !== 'https:') {
        return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname.endsWith('.local') ||
        hostname.endsWith('.internal') ||
        hostname.endsWith('.lan')
    ) {
        return false;
    }
    // Block IP literals that fall into loopback/private/metadata space. Public
    // hostnames that resolve to such ranges are additionally constrained by the
    // https-only scheme check and should be covered by egress controls at deploy.
    const ipPattern = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
    if (ipPattern.test(hostname)) {
        const labels = hostname.split('.');
        const firstLabel = parseInt(labels[0], 10);
        const secondLabel = parseInt(labels[1] || '0', 10);
        if (
            firstLabel === 127 ||
            firstLabel === 0 ||
            firstLabel === 10 ||
            (firstLabel === 172 && secondLabel >= 16 && secondLabel <= 31) ||
            (firstLabel === 192 && secondLabel === 168) ||
            firstLabel === 169
        ) {
            return false;
        }
    }
    return true;
}

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
    // Only fetch public https URLs. If this validation is not performed, the
    // renderer can turn the main process into an SSRF proxy for internal
    // services and cloud metadata endpoints.
    if (!isAllowedHttpTarget(urlString)) {
        return JSON.stringify({
            error: 'Refusing to fetch a disallowed URL',
        });
    }
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
const codeUriKey = 'code_uri=';

function createExternalView(
    browserView: BrowserView,
    window: BrowserWindow,
    location: string,
    rect: Rectangle
): Promise<ViewResponse> {
    return new Promise((resolve) => {
        window.setBrowserView(browserView);
        browserView.setBounds(rect);
        browserView.webContents.clearHistory();
        browserView.webContents
            .loadURL(location)
            .then(() => {
                // Ignoring ts as it otherwise blocks us from using a custom
                // event name ('abort').
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                browserView.webContents.once('abort', async () => {
                    resolve({
                        status: ViewResponseStatus.Aborted,
                    });
                });

                const checkForRedirectToken = (event: Event, url: string) => {
                    // If the redirect contains the location of the identity, then do not
                    // follow it, but extract the URL and return it.
                    if (url.includes(redirectUri)) {
                        event.preventDefault();
                        resolve({
                            status: ViewResponseStatus.Success,
                            result: url.substring(
                                url.indexOf(codeUriKey) + codeUriKey.length
                            ),
                        });
                    }
                };
                browserView.webContents.on(
                    'will-navigate',
                    checkForRedirectToken
                );
                return browserView.webContents.on(
                    'will-redirect',
                    checkForRedirectToken
                );
            })
            .catch((e) =>
                resolve({ error: e.message, status: ViewResponseStatus.Error })
            );
    });
}

export function getUserDataPath() {
    return app.getPath('userData');
}

export function saveFileDialog(opts: SaveDialogOptions) {
    return dialog.showSaveDialog(opts);
}

/**
 * Removes all ipcMain handlers registered by 'initializeIpcHandler'.
 */
export function removeAllIpcHandlers() {
    ipcMain.removeHandler(ipcCommands.getUserDataPath);
    ipcMain.removeHandler(ipcCommands.print);
    ipcMain.removeHandler(ipcCommands.openUrl);
    ipcMain.removeHandler(ipcCommands.httpsGet);
    ipcMain.removeHandler(ipcCommands.createView);
    ipcMain.removeHandler(ipcCommands.removeView);
    ipcMain.removeHandler(ipcCommands.resizeView);
    ipcMain.removeHandler(ipcCommands.saveFileDialog);
    ipcMain.removeHandler(ipcCommands.openFileDialog);
    ipcMain.removeHandler(ipcCommands.messageBox);
}

/**
 * Initializes ipcMain handlers.
 *
 * If adding a new handler to this method, then ensure that 'removeAllIpcHandlers'
 * above is updated to keep in sync with this method.
 */
export function initializeIpcHandlers(
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
        return openExternal(url);
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
    ipcMain.handle(ipcCommands.removeView, () => {
        browserView.webContents.emit('abort');
        browserView.webContents.removeAllListeners('will-navigate');
        browserView.webContents.removeAllListeners('will-redirect');

        // Load a blank page to prevent flashing of a previous identity
        // provider page.
        browserView.webContents.loadURL('about:blank');
        mainWindow.removeBrowserView(browserView);
    });
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

    ipcMain.handle(ipcCommands.messageBox, async (_event, opts) => {
        return dialog.showMessageBox(mainWindow, opts);
    });
}
