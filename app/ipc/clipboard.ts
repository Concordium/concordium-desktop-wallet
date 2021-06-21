import { clipboard, IpcMain, nativeImage } from 'electron';
import ipcCommands from '~/constants/ipcCommands.json';

/**
 * Writes the image, provided as a data url, to the clipboard.
 */
function writeImageToClipboard(dataUrl: string) {
    const img = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(img);
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.writeImageToClipboard,
        (_event, dataUrl: string) => {
            return writeImageToClipboard(dataUrl);
        }
    );
}
