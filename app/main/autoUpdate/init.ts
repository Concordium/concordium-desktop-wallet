import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';

import {
    updateAvailable,
    updateDownloaded,
    updateVerified,
    updateError,
} from '~/constants/ipcRendererCommands.json';
import {
    triggerAppUpdate,
    quitAndInstallUpdate,
} from '~/constants/ipcCommands.json';

import { version } from '../../package.json';
import { build } from '../../../package.json';
import { getVerificationFunctions, RealUpdateInfo } from './verify';

let configured = false;
function configure() {
    const updateServer = 'https://update.electronjs.org';
    const updateFeed = `${updateServer}/${build.publish.owner}/${build.publish.repo}/${process.platform}-${process.arch}/${version}/`;
    autoUpdater.setFeedURL({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(build.publish as any),
        url: updateFeed,
    });

    log.transports.file.level = 'info';

    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    configured = true;
}

const handleUpdateDownloaded = (mainWindow: BrowserWindow) => async (
    info: UpdateInfo
) => {
    mainWindow.webContents.send(updateDownloaded);

    const { verifyChecksum, verifySignature } = getVerificationFunctions(
        info as RealUpdateInfo
    );

    try {
        await Promise.all([verifyChecksum(), verifySignature()]);
        mainWindow.webContents.send(updateVerified);
    } catch (e) {
        log.error('Could not update application due to:', e);
        mainWindow.webContents.send(updateError, 'Could not apply update.');
    }
};

export default function initAutoUpdate(mainWindow: BrowserWindow) {
    if (!configured) {
        configure();
    }

    autoUpdater.on('update-available', (info) =>
        mainWindow.webContents.send(updateAvailable, info)
    );
    autoUpdater.on('update-downloaded', handleUpdateDownloaded(mainWindow));

    ipcMain.handle(triggerAppUpdate, () => autoUpdater.downloadUpdate());
    ipcMain.handle(quitAndInstallUpdate, () => autoUpdater.quitAndInstall());

    autoUpdater.checkForUpdates();
}
