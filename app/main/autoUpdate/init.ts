import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
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
        mainWindow.webContents.send(updateError, 'Could not apply update.', e);
    }
};

/**
 * Removes all ipcMain handlers and auto update listeners added by
 * 'initAutoUpdate'.
 */
export function removeAutoUpdateHandlersAndListeners() {
    autoUpdater.removeAllListeners('update-available');
    autoUpdater.removeAllListeners('error');
    autoUpdater.removeAllListeners('update-downloaded');
    ipcMain.removeHandler(triggerAppUpdate);
    ipcMain.removeHandler(quitAndInstallUpdate);
}

/**
 * Initializes the auto update functionality by setting up handlers
 * and auto update listeners.
 *
 * If adding a new handler to this method, then ensure that 'removeAutoUpdateHandlersAndListeners'
 * above is updated to keep in sync with this method.
 */
export function initAutoUpdate(
    mainWindow: BrowserWindow,
    network: 'mainnet' | 'testnet' | 'stagenet'
) {
    const canAutoUpdate =
        process.platform === 'win32' ||
        process.platform === 'darwin' ||
        process.env.APPIMAGE;

    // For mainnet we use the default channel
    const channel = network === 'mainnet' ? undefined : network;
    autoUpdater.setFeedURL({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(build.publish as any),
        url: updateFeed,
        channel,
    });

    autoUpdater.on('update-available', (info) =>
        mainWindow.webContents.send(updateAvailable, info, canAutoUpdate)
    );

    if (canAutoUpdate) {
        autoUpdater.on('error', (e) =>
            mainWindow.webContents.send(
                updateError,
                'Could not download update.',
                e
            )
        );
        autoUpdater.on('update-downloaded', handleUpdateDownloaded(mainWindow));

        ipcMain.handle(triggerAppUpdate, () => autoUpdater.downloadUpdate());
        ipcMain.handle(quitAndInstallUpdate, () =>
            autoUpdater.quitAndInstall()
        );
    }

    autoUpdater.checkForUpdates();
}
