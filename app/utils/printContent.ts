import { ipcRenderer } from 'electron';
import ipcCommands from '../constants/ipcCommands.json';

export default async function printContent(target: HTMLIFrameElement) {
    await ipcRenderer.invoke(
        ipcCommands.print,
        encodeURI(target.contentWindow!.document.body.outerHTML),
        target.contentWindow!.document.body.style
    );
}
