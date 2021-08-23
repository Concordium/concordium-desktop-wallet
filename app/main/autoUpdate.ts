import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import {
    updateAvailable,
    logFromMain,
} from '~/constants/ipcRendererCommands.json';
import { triggerAppUpdate } from '~/constants/ipcCommands.json';

import { version } from '../package.json';

const server = 'https://update.electronjs.org';
const feed = `${server}/soerenbf/concordium-desktop-wallet/${process.platform}-${process.arch}/${version}/`;
autoUpdater.setFeedURL({
    url: feed,
    provider: 'github',
    owner: 'soerenbf',
    repo: 'concordium-desktop-wallet',
});

log.transports.file.level = 'info';

autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

async function verifyUpdate(filePath: string, mainWindow: BrowserWindow) {
    /**
     * 1. Get remote hash, sig, & pub key
     * 2. Compute hash of file
     * 3. Verify matching hash and signature
     */

    mainWindow.webContents.send(logFromMain, 'Verify update -', filePath);

    return new Promise(() => {});
}

const updateApplication = (mainWindow: BrowserWindow) => async () => {
    /**
     * 1. Download update
     * 2. Verify hash against remote
     * 3. Verify signature of hash
     * 4. Install and restart
     */

    try {
        const updatePath: string = (await autoUpdater.downloadUpdate())[0];
        autoUpdater.logger?.info(JSON.stringify(updatePath));

        await verifyUpdate(updatePath, mainWindow);

        // autoUpdater.quitAndInstall();
    } catch {
        // Show error notification...
    }
};

export default function initAutoUpdate(mainWindow: BrowserWindow) {
    autoUpdater.on('update-available', () =>
        mainWindow.webContents.send(updateAvailable)
    );

    ipcMain.handle(triggerAppUpdate, updateApplication(mainWindow));

    autoUpdater.checkForUpdates();
}
