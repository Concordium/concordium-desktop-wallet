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
import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import ipcCommands from './constants/ipcCommands.json';
import ipcRendererCommands from './constants/ipcRendererCommands.json';
import initializeIpcHandlers from './ipc/http';
import initializeLedgerIpcHandlers from './ipc/ledger';
import initializeCryptoIpcHandlers from './ipc/crypto';
import initializeDatabaseGeneralIpcHandlers from './ipc/database/general';
import initializeDatabaseAccountIpcHandlers from './ipc/database/accountDao';
import initializeDatabaseAddressBookIpcHandlers from './ipc/database/addressBookDao';
import initializeDatabaseCredentialIpcHandlers from './ipc/database/credentialDao';
import initializeDatabaseIdentityIpcHandlers from './ipc/database/identityDao';
import initializeDatabaseGenesisAndGlobalIpcHandlers from './ipc/database/genesisAndGlobalDao';
import initializeDatabaseMultiSignatureTransactionIpcHandlers from './ipc/database/multiSignatureProposalDao';
import initializeDatabaseSettingsIpcHandlers from './ipc/database/settingsDao';
import initializeDatabaseTransactionsIpcHandlers from './ipc/database/transactionsDao';
import initializeDatabaseWalletIpcHandlers from './ipc/database/walletDao';
import initializeFilesIpcHandlers from './ipc/files';
import initializeGrpcIpcHandlers from './ipc/grpc';
import initializeClipboardIpcHandlers from './ipc/clipboard';
import { PrintErrorTypes } from './utils/types';

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
    if (process.env.DEBUG_PROD === 'true') {
        await installExtensions();
    }

    const titleSuffix = process.env.TARGET_NET || '';
    const commonMainPreferences: Electron.WebPreferences = {
        nodeIntegration: false,
        contextIsolation: false,
        worldSafeExecuteJavaScript: false,
        webviewTag: true,
    };

    /**
     * Do not change any of the webpreference settings without consulting the
     * security documentation provided
     */
    mainWindow = new BrowserWindow({
        title: `Concordium Wallet ${titleSuffix}`,
        show: false,
        width: 4096,
        height: 2912,
        webPreferences:
            process.env.NODE_ENV === 'development'
                ? {
                      ...commonMainPreferences,
                      preload: path.join(__dirname, 'preload.dev.js'),
                      devTools: true,
                  }
                : {
                      ...commonMainPreferences,
                      preload: path.join(__dirname, 'dist/preload.prod.js'),

                      devTools: false,
                  },
    });

    if (process.env.NODE_ENV === 'production') {
        mainWindow.loadURL(`file://${__dirname}/app.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/app-dev.html`);
    }

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

        mainWindow.webContents.send(ipcRendererCommands.didFinishLoad);
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow?.webContents.send(ipcRendererCommands.readyToShow);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.setMenuBarVisibility(false);

    printWindow = new BrowserWindow({
        parent: mainWindow,
        modal: false,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            devTools: false,
            contextIsolation: false,
        },
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();

    // Setup the IPC methods, so that the renderer threads
    // can access the exposed methods. This will be moved to
    // the pre-load script when turning on context isolation.
    initializeIpcHandlers(ipcMain);
    initializeLedgerIpcHandlers(ipcMain, mainWindow);
    initializeCryptoIpcHandlers(ipcMain);
    initializeFilesIpcHandlers(ipcMain);
    initializeGrpcIpcHandlers(ipcMain);
    initializeDatabaseGeneralIpcHandlers(ipcMain);
    initializeDatabaseAccountIpcHandlers(ipcMain);
    initializeDatabaseAddressBookIpcHandlers(ipcMain);
    initializeDatabaseCredentialIpcHandlers(ipcMain);
    initializeDatabaseIdentityIpcHandlers(ipcMain);
    initializeDatabaseGenesisAndGlobalIpcHandlers(ipcMain);
    initializeDatabaseMultiSignatureTransactionIpcHandlers(ipcMain);
    initializeDatabaseSettingsIpcHandlers(ipcMain);
    initializeDatabaseTransactionsIpcHandlers(ipcMain);
    initializeDatabaseWalletIpcHandlers(ipcMain);
    initializeClipboardIpcHandlers(ipcMain);
};

async function print(body: string) {
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
}

// Prints the given body.
ipcMain.handle(ipcCommands.print, async (_event, body) => {
    return print(body);
});

ipcMain.handle(ipcCommands.openUrl, (_event, url: string) => {
    if (!mainWindow) {
        return;
    }
    shell.openExternal(url);
});

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
