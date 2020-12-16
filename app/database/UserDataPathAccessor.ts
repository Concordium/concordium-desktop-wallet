import { app, ipcRenderer } from 'electron';

let appPath: string;

/**
 * Gets the userdata path that can be used as the directory to store
 * application specific data, e.g. the database file.
 *
 * Note that the method can be called from both the main process
 * and a renderer process.
 */
export default async function getPath() {
    if (!appPath) {
        // We are in the main process (this occurs when doing migration).
        if (!ipcRenderer) {
            appPath = app.getPath('userData');
        } else {
            // Renderer process (acess from renderer process).
            appPath = await ipcRenderer.invoke('APP_GET_PATH');
        }
    }
    return appPath;
}
