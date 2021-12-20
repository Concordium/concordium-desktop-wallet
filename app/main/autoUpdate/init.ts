import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';
import ipcRendererCommands from '~/constants/ipcRendererCommands.json';
import ipcCommands from '~/constants/ipcCommands.json';

import packageJson from '../../../package.json';
import appPackageJson from '../../package.json';
import { getVerificationFunctions, RealUpdateInfo } from './verify';

const {
    updateAvailable,
    updateDownloaded,
    updateVerified,
    updateError,
} = ipcRendererCommands;
const { triggerAppUpdate, quitAndInstallUpdate } = ipcCommands;
const { build } = packageJson;
const { version } = appPackageJson;

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
    autoUpdater.on('update-available', (info) =>
        mainWindow.webContents.send(updateAvailable, info)
    );
    autoUpdater.on('error', () =>
        mainWindow.webContents.send(updateError, 'Could not download update.')
    );
    autoUpdater.on('update-downloaded', handleUpdateDownloaded(mainWindow));

    ipcMain.handle(triggerAppUpdate, () => autoUpdater.downloadUpdate());
    ipcMain.handle(quitAndInstallUpdate, () => autoUpdater.quitAndInstall());

    autoUpdater.checkForUpdates();
}
