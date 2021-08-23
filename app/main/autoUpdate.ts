import axios, { AxiosRequestConfig } from 'axios';
import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';

import {
    updateAvailable,
    logFromMain,
} from '~/constants/ipcRendererCommands.json';
import { triggerAppUpdate } from '~/constants/ipcCommands.json';

import { version } from '../package.json';

const updateServer = 'https://update.electronjs.org';
const updateFeed = `${updateServer}/soerenbf/concordium-desktop-wallet/${process.platform}-${process.arch}/${version}/`;
autoUpdater.setFeedURL({
    url: updateFeed,
    provider: 'github',
    owner: 'soerenbf',
    repo: 'concordium-desktop-wallet',
});

log.transports.file.level = 'info';

autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

interface RealUpdateInfo extends UpdateInfo {
    downloadFile: string;
}

async function getRemoteContent(url: string, binary = false) {
    const options: AxiosRequestConfig = {};

    if (binary) {
        options.responseType = 'arraybuffer';
    }

    const res = await axios.get(url, options);

    return res.data;
}

const releasesFeed =
    'https://github.com/soerenbf/concordium-desktop-wallet/releases/download';

async function verifyUpdate(
    { downloadedFile: filePath, releaseName, path: fileName }: RealUpdateInfo, // UpdateInfo interface doesn't seem to be aligned with actual content.
    mainWindow: BrowserWindow
) {
    /**
     * 1. Get remote hash, sig, & pub key
     * 2. Compute hash of file
     * 3. Verify matching hash and signature
     */

    const releaseUrl = `${releasesFeed}/${releaseName}/${fileName}`;
    const hash = await getRemoteContent(`${releaseUrl}.hash`);
    const sig = await getRemoteContent(`${releaseUrl}.sig`);

    mainWindow.webContents.send(logFromMain, 'Verify update -', filePath);
    mainWindow.webContents.send(logFromMain, 'release url: ', releaseUrl);
    mainWindow.webContents.send(logFromMain, 'Hash', hash);
    mainWindow.webContents.send(logFromMain, 'Sig', sig);

    return new Promise(() => {});
}

const updateApplication = async () => {
    try {
        await autoUpdater.downloadUpdate();
    } catch {
        // Show error notification...
    }
};

const handleUpdateDownloaded = (mainWindow: BrowserWindow) => async (
    info: UpdateInfo
) => {
    mainWindow.webContents.send(
        logFromMain,
        'Update downlaoded:',
        JSON.stringify(info)
    );

    await verifyUpdate(info as RealUpdateInfo, mainWindow);
    // autoUpdater.quitAndInstall();
};

export default function initAutoUpdate(mainWindow: BrowserWindow) {
    autoUpdater.on('update-available', () =>
        mainWindow.webContents.send(updateAvailable)
    );
    autoUpdater.on('update-downloaded', handleUpdateDownloaded(mainWindow));

    ipcMain.handle(triggerAppUpdate, updateApplication);

    autoUpdater.checkForUpdates();
}
