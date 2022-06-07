import { ipcRenderer } from 'electron';
import ipcRendererCommands from '~/constants/ipcRendererCommands.json';
import ipcCommands from '~/constants/ipcCommands.json';
import { Listener, AutoUpdateMethods } from './preloadTypes';

const createListener = (channel: string) => (func: Listener) => {
    ipcRenderer.on(channel, func);
    return () => ipcRenderer.off(channel, func);
};

const onUpdateAvailable = createListener(ipcRendererCommands.updateAvailable);
const onUpdateDownloaded = createListener(ipcRendererCommands.updateDownloaded);
const onVerificationSuccess = createListener(
    ipcRendererCommands.updateVerified
);
const onError = createListener(ipcRendererCommands.updateError);

const triggerUpdate = () => ipcRenderer.invoke(ipcCommands.triggerAppUpdate);
const quitAndInstall = () =>
    ipcRenderer.invoke(ipcCommands.quitAndInstallUpdate);

const exposedMethods: AutoUpdateMethods = {
    onUpdateAvailable,
    onUpdateDownloaded,
    onVerificationSuccess,
    onError,
    triggerUpdate,
    quitAndInstall,
};

export default exposedMethods;
