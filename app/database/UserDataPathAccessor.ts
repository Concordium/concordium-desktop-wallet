import { appGetPath } from '../constants/ipcCommands.json';

let appPath: string;

/**
 * Gets the userdata path that can be used as the directory to store
 * application specific data, e.g. the database file.
 */
export default async function getPath() {
    if (!appPath) {
        appPath = await window.ipcRenderer.invoke(appGetPath);
    }
    return appPath;
}
