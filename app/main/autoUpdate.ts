import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import { updateAvailable } from '~/constants/ipcRendererCommands.json';
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

async function updateApplication() {
    /**
     * 1. Download update
     * 2. Verify hash against remote
     * 3. Verify signature of hash
     * 4. Install and restart
     */

    const r = await autoUpdater.downloadUpdate();
    autoUpdater.logger?.info(JSON.stringify(r));

    autoUpdater.quitAndInstall();
}

export default function initAutoUpdate(mainWindow: BrowserWindow) {
    autoUpdater.on('update-available', () =>
        mainWindow.webContents.send(updateAvailable)
    );

    ipcMain.handle(triggerAppUpdate, updateApplication);

    autoUpdater.checkForUpdates();
}
