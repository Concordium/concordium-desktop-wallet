import { PrintErrorTypes } from './types';

export default async function printContent(target: HTMLIFrameElement) {
    const windowToPrint = target.contentWindow;
    if (!windowToPrint) {
        throw new Error('Unexpected missing contentWindow');
    }
    let error;

    try {
        error = await window.printElement(
            encodeURIComponent(windowToPrint.document.body.outerHTML)
        );
    } catch (e) {
        throw new Error(`Failed to print due to: ${e.message}.`);
    }
    if (error) {
        switch (error) {
            case PrintErrorTypes.NoPrinters:
                throw new Error(
                    `Unable to find any printers, please connect a printer.`
                );
            case PrintErrorTypes.Failed:
                throw new Error(`The printer driver reported failure.`);
            default:
                throw new Error(`Failed to print due to: ${error}.`);
        }
    }
}
