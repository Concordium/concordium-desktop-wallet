import { ipcRenderer } from 'electron';
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
import { Listener, AutoUpdateMethods } from './preloadTypes';

const createListener = (channel: string) => (func: Listener) => {
    ipcRenderer.on(channel, func);
    return () => ipcRenderer.off(channel, func);
};

const onUpdateAvailable = createListener(updateAvailable);
const onUpdateDownloaded = createListener(updateDownloaded);
const onVerificationSuccess = createListener(updateVerified);
const onError = createListener(updateError);

const triggerUpdate = () => ipcRenderer.invoke(triggerAppUpdate);
const quitAndInstall = () => ipcRenderer.invoke(quitAndInstallUpdate);

const exposedMethods: AutoUpdateMethods = {
    onUpdateAvailable,
    onUpdateDownloaded,
    onVerificationSuccess,
    onError,
    triggerUpdate,
    quitAndInstall,
};

export default exposedMethods;
