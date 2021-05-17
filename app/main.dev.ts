/* eslint no-console: off, @typescript-eslint/no-var-requires: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import ipcCommands from './constants/ipcCommands.json';
import { setClientLocation, grpcCall } from './main/GRPCClient';

export default class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;

        // Disable automatic updates for now.
        // autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;
let printWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
) {
    require('electron-debug')();
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return installer
        .default(
            extensions.map((name) => installer[name]),
            forceDownload
        )
        .catch(console.log);
};

const createWindow = async () => {
    if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
    ) {
        await installExtensions();
    }

    mainWindow = new BrowserWindow({
        show: false,
        width: 4096,
        height: 2912,
        webPreferences:
            (process.env.NODE_ENV === 'development' ||
                process.env.E2E_BUILD === 'true') &&
            process.env.ERB_SECURE !== 'true'
                ? {
                      nodeIntegration: true,
                      webviewTag: true,
                  }
                : {
                      preload: path.join(__dirname, 'dist/renderer.prod.js'),
                      webviewTag: true,
                  },
    });

    printWindow = new BrowserWindow({
        parent: mainWindow,
        modal: false,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            devTools: false,
        },
    });

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.setMenuBarVisibility(false);

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
};

// Provides access to the userData path from renderer processes.
ipcMain.handle(ipcCommands.appGetPath, () => {
    return app.getPath('userData');
});

// Provides access to file dialog windows from renderer processes.
ipcMain.handle(ipcCommands.openFileDialog, async (_event, title) => {
    return dialog.showOpenDialog({ title });
});

// Provides access to save file dialog from renderer processes.
ipcMain.handle(ipcCommands.saveFileDialog, async (_event, opts) => {
    return dialog.showSaveDialog(opts);
});

// Updates the location of the grpc endpoint.
ipcMain.handle(
    ipcCommands.grpcSetLocation,
    async (_event, address: string, port: string) => {
        return setClientLocation(address, port);
    }
);

// Performs the given grpc command, with the given input;
ipcMain.handle(
    ipcCommands.grpcCall,
    async (_event, command: string, input: Record<string, string>) => {
        try {
            const response = await grpcCall(command, input);
            return { successful: true, response };
        } catch (error) {
            return { successful: false, error };
        }
    }
);

enum PrintErrorTypes {
    Cancelled = 'cancelled',
    Failed = 'failed',
    NoPrinters = 'no valid printers available',
}

// Prints the given body.
ipcMain.handle(ipcCommands.print, (_event, body) => {
    return new Promise<string | void>((resolve, reject) => {
        if (!printWindow) {
            reject(new Error('Internal error: Unable to print'));
        } else {
            printWindow.loadURL(`data:text/html;charset=utf-8,${body}`);
            const content = printWindow.webContents;
            content.on('did-finish-load', () => {
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
});

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

if (process.env.E2E_BUILD === 'true') {
    // eslint-disable-next-line promise/catch-or-return
    app.whenReady().then(createWindow);
} else {
    app.on('ready', createWindow);
}

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
});

// The default changed after Electron 8, this sets the value
// equal to the Electron 8 value to avoid having to rework what
// is broken by the change in value.
// Note that in future Electron releases we will not have the option
// to set this to false.
app.allowRendererProcessReuse = false;
