import axios, { AxiosRequestConfig } from 'axios';
import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';
import { createHash } from 'crypto';
import fs from 'fs';

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
    downloadedFile: string;
}

async function getRemoteContent(url: string, binary = false) {
    const options: AxiosRequestConfig = {};

    if (binary) {
        options.responseType = 'arraybuffer';
    }

    const { data } = await axios.get(url, options);
    return data;
}

function getSha256Sum(path: string): string {
    const sum = createHash('sha256');
    const stream = fs.createReadStream(path);
    stream.on('data', (data) => sum.update(data));
    stream.on('end', () => resolve(sum.digest('hex')));
    stream.on('error', reject);
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
    const remoteHash = await getRemoteContent(`${releaseUrl}.hash`);
    const remoteSig = await getRemoteContent(`${releaseUrl}.sig`);

    mainWindow.webContents.send(logFromMain, 'Verify update -', filePath);
    mainWindow.webContents.send(logFromMain, 'release url: ', releaseUrl);
    mainWindow.webContents.send(logFromMain, 'Remote hash', remoteHash);
    mainWindow.webContents.send(logFromMain, 'Remote sig', remoteSig);

    const localHash = getSha256Sum(filePath);

    mainWindow.webContents.send(logFromMain, 'Local hash', localHash);
    mainWindow.webContents.send(
        logFromMain,
        'Hash equality',
        localHash === remoteHash
    );

    return new Promise(() => {});
}

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

    ipcMain.handle(triggerAppUpdate, () => autoUpdater.downloadUpdate());

    autoUpdater.checkForUpdates();
}
