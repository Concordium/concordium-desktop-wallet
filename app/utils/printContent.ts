import ipcCommands from '../constants/ipcCommands.json';

export default async function printContent(target: HTMLIFrameElement) {
    const window = target.contentWindow;
    if (!window) {
        throw new Error('Unexpected missing contentWindow');
    }
    let error;
    try {
        error = await window.ipcRenderer.invoke(
            ipcCommands.print,
            encodeURI(window.document.body.outerHTML)
        );
    } catch (e) {
        throw new Error('Failed to Print');
    }
    if (error) {
        throw new Error(`Failed to print due to: ${error}`);
    }
}
