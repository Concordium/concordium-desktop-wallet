import ipcCommands from '../constants/ipcCommands.json';

export default async function printContent(target: HTMLIFrameElement) {
    const windowToPrint = target.contentWindow;
    if (!windowToPrint) {
        throw new Error('Unexpected missing contentWindow');
    }
    let error;

    try {
        error = await window.ipcRenderer.invoke(
            ipcCommands.print,
            encodeURI(windowToPrint.document.body.outerHTML)
        );
    } catch (e) {
        throw new Error('Failed to print');
    }
    if (error) {
        throw new Error(`Failed to print due to: ${error}`);
    }
}
