import axios, { AxiosRequestConfig } from 'axios';
import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';
import { createHash, createVerify, Verify } from 'crypto';
import fs from 'fs';

import { updateAvailable } from '~/constants/ipcRendererCommands.json';
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

function getSha256Sum(path: string): Promise<string> {
    const sum = createHash('sha256');
    const stream = fs.createReadStream(path);

    stream.on('data', (data) => sum.update(data));

    return new Promise((resolve, reject) => {
        stream.on('end', () => resolve(sum.digest('hex')));
        stream.on('error', reject);
    });
}

function getVerifier(path: string): Promise<Verify> {
    const verifier = createVerify('RSA-SHA256');
    const stream = fs.createReadStream(path);

    stream.on('data', (data) => verifier.update(data));

    return new Promise((resolve, reject) => {
        stream.on('end', () => resolve(verifier));
        stream.on('error', reject);
    });
}

const releasesFeed =
    'https://github.com/soerenbf/concordium-desktop-wallet/releases/download';

function getVerificationFunctions(
    { downloadedFile: filePath, releaseName, path: fileName }: RealUpdateInfo // UpdateInfo interface doesn't seem to be aligned with actual content.
) {
    const releaseDir = `${releasesFeed}/${releaseName}`;
    const releasePath = `${releaseDir}/${fileName}`;

    return {
        async verifyChecksum() {
            const remoteHash = (
                await getRemoteContent(`${releasePath}.hash`)
            ).trim();
            const localHash = await getSha256Sum(filePath);

            if (localHash !== remoteHash) {
                throw new Error(
                    `Local checksum of update does not match remote checksum (local: ${localHash}, remote: ${remoteHash}).`
                );
            }
        },
        async verifySignature() {
            const [remoteSig, pubKey] = await Promise.all([
                getRemoteContent(`${releasePath}.sig`, true),
                getRemoteContent(`${releaseDir}/pubkey.pem`),
            ]);

            const verifier = await getVerifier(filePath);
            const success = verifier.verify(
                Buffer.from(pubKey, 'ascii'),
                remoteSig
            );

            if (!success) {
                throw new Error('Signature verification failed.');
            }
        },
    };
}

async function handleUpdateDownloaded(info: UpdateInfo) {
    const { verifyChecksum, verifySignature } = getVerificationFunctions(
        info as RealUpdateInfo,
        mainWindow
    );

    try {
        await Promise.all([verifyChecksum(), verifySignature()]);

        autoUpdater.quitAndInstall();
    } catch (e) {
        log.error('Could not update application due to:', e);

        // TODO: show notification.
    }
}

export default function initAutoUpdate(mainWindow: BrowserWindow) {
    autoUpdater.on('update-available', () =>
        mainWindow.webContents.send(updateAvailable)
    );
    autoUpdater.on('update-downloaded', handleUpdateDownloaded);

    ipcMain.handle(triggerAppUpdate, () => autoUpdater.downloadUpdate());

    autoUpdater.checkForUpdates();
}
