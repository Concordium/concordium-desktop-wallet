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
import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import * as crypto from 'crypto';
import ipcCommands from './constants/ipcCommands.json';
import ipcRendererCommands from './constants/ipcRendererCommands.json';
import { setClientLocation, grpcCall } from './node/GRPCClient';
import ConcordiumNodeClient from './node/ConcordiumNodeClient';
import { ConsensusStatus } from './node/NodeApiTypes';
import { JsonResponse } from './proto/concordium_p2p_rpc_pb';
import { getDatabaseFilename } from './database/knexfile';
import { subscribeLedger } from './ledgerObserver';
import initializeIpcHandlers from './ipc/http';
import initializeLedgerIpcHandlers from './ipc/ledger';
import initializeEncryptionIpcHandlers from './ipc/encryption';
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
                      preload: path.join(__dirname, 'dist/preload.prod.js'),
                      nodeIntegration: false,
                      webviewTag: true,
                      devTools: true,
                  }
                : {
                      preload: path.join(__dirname, 'dist/preload.prod.js'),
                      webviewTag: true,
                      nodeIntegration: false,
                      devTools: true,
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
        // Start ledger listener
        subscribeLedger(mainWindow);
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow?.webContents.send(ipcRendererCommands.readyToShow);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.setMenuBarVisibility(false);

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
};

// TODO move to preload script as that is where the context isolated code will be as well.
initializeIpcHandlers(ipcMain);
initializeLedgerIpcHandlers(ipcMain);
initializeEncryptionIpcHandlers(ipcMain);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle(ipcCommands.databaseExists, async (_event) => {
    const databaseFilename = await getDatabaseFilename();
    if (!fs.existsSync(databaseFilename)) {
        return false;
    }
    const stats = fs.statSync(databaseFilename);
    return stats.size > 0;
});

ipcMain.handle(
    ipcCommands.sha256,
    async (_event, data: (Buffer | Uint8Array)[]) => {
        const hash = crypto.createHash('sha256');
        data.forEach((input) => hash.update(input));
        return hash.digest();
    }
);

ipcMain.handle(
    ipcCommands.saveFile,
    (_event, filepath: string, data: string | Buffer) => {
        fs.writeFile(filepath, data, (err) => {
            if (err) {
                return Promise.reject(new Error(`Unable to save file: ${err}`));
            }
            return Promise.resolve(true);
        });
    }
);

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

// Creates a standalone GRPC client for testing the connection
// to a node. This is used to verify that when changing connection
// that the new node is on the same blockchain as the wallet was previously connected to.
ipcMain.handle(
    ipcCommands.grpcNodeConsensusAndGlobal,
    async (_event, address: string, port: string) => {
        try {
            const nodeClient = new ConcordiumNodeClient(
                address,
                Number.parseInt(port, 10)
            );
            const consensusStatusSerialized = await nodeClient.getConsensusStatus();
            const consensusStatus: ConsensusStatus = JSON.parse(
                JsonResponse.deserializeBinary(
                    consensusStatusSerialized
                ).getValue()
            );
            const globalSerialized = await nodeClient.getCryptographicParameters(
                consensusStatus.lastFinalizedBlock
            );
            return {
                successful: true,
                response: {
                    consensus: consensusStatusSerialized,
                    global: globalSerialized,
                },
            };
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

ipcMain.handle(ipcCommands.openUrl, (_event, url: string) => {
    if (!mainWindow) {
        return;
    }
    shell.openExternal(url);
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
