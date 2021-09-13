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
import { app, BrowserView, BrowserWindow } from 'electron';
import ipcRendererCommands from './constants/ipcRendererCommands.json';
import { createMenu } from './main/menu';
import initializeIpcHandlers from './main/ipcHandlers';
import initAutoUpdate from './main/autoUpdate';

let mainWindow: BrowserWindow | null = null;
let printWindow: BrowserWindow | null = null;
let browserView: BrowserView | null = null;

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
        contextIsolation: true,
        worldSafeExecuteJavaScript: false,
        webviewTag: false,
    };

    /**
     * Do not change any of the webpreference settings without consulting the
     * security documentation provided
     */
    mainWindow = new BrowserWindow({
        title: `Concordium Wallet ${titleSuffix}`,
        show: false,
        minWidth: 800,
        minHeight: 600,
        ...(process.env.NODE_ENV === 'development'
            ? {
                  width: 2560,
                  height: 1440,
              }
            : {
                  width: 1400,
                  height: 1000,
              }),
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

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        const urlPath = url.split('#')[1];
        mainWindow?.webContents.send(ipcRendererCommands.openRoute, urlPath);

        return { action: 'deny' };
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

    // make menu accessible on windows/linux
    mainWindow.setAutoHideMenuBar(true);
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

    browserView = new BrowserView();

    initializeIpcHandlers(mainWindow, printWindow, browserView);

    if (process.env.NODE_ENV === 'production' && !process.env.TARGET_NET) {
        initAutoUpdate(mainWindow);
    }
};

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
    app.on('ready', async () => {
        await createWindow();

        if (mainWindow) {
            createMenu(mainWindow);
        }
    });
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
