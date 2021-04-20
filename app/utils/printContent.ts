import { ipcRenderer } from 'electron';
import ipcCommands from '../constants/ipcCommands.json';

export default async function printContent(target: HTMLIFrameElement) {
    const window = target.contentWindow;
    if (!window) {
        throw new Error('Unexpected missing contentWindow');
    }
    await ipcRenderer.invoke(
        ipcCommands.print,
        encodeURI(window.document.body.outerHTML)
    );
}
