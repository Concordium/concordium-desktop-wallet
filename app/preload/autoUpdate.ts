import { ipcRenderer } from 'electron';
import { updateAvailable } from '~/constants/ipcRendererCommands.json';
import { triggerAppUpdate } from '~/constants/ipcCommands.json';
import { Listener, AutoUpdateMethods } from './preloadTypes';

const onUpdateAvailable = (func: Listener) =>
    ipcRenderer.on(updateAvailable, func);

const triggerUpdate = () => ipcRenderer.invoke(triggerAppUpdate);

const exposedMethods: AutoUpdateMethods = {
    onUpdateAvailable,
    triggerUpdate,
};

export default exposedMethods;
